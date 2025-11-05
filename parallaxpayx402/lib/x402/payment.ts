/**
 * X402 Payment Creator
 * Creates payment requests compatible with our x402 facilitator
 */

import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import type { X402Wallet } from './wallet';

export interface PaymentRequirements {
  amount: string;
  recipient: string;
  facilitator: string;
  protocol?: string;
}

export interface PaymentRequest {
  payload: {
    amount: string;
    recipient: string;
    resourceId: string;
    resourceUrl: string;
    nonce: string;
    timestamp: number;
    expiry: number;
  };
  signature: string;
  clientPublicKey: string;
  signedTransaction: string;
}

/**
 * Create a payment request from 402 response
 */
export async function createPaymentRequest(
  wallet: X402Wallet,
  requirements: PaymentRequirements,
  resourceUrl: string,
  connection: Connection
): Promise<PaymentRequest> {
  // Generate nonce for replay protection (browser-compatible)
  const nonceBytes = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(nonceBytes);
  } else {
    // Fallback for Node.js
    nacl.randomBytes(32).forEach((byte, i) => nonceBytes[i] = byte);
  }
  const nonce = Array.from(nonceBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const timestamp = Date.now();
  const expiry = timestamp + 3600000; // 1 hour

  // Create authorization payload
  const payload = {
    amount: requirements.amount,
    recipient: requirements.recipient,
    resourceId: resourceUrl,
    resourceUrl: resourceUrl,
    nonce: nonce,
    timestamp: timestamp,
    expiry: expiry,
  };

  // Create structured data to sign (for off-chain verification)
  const structuredData = {
    domain: {
      name: 'x402-solana-protocol',
      version: '1',
      chainId: 'devnet',
      verifyingContract: 'x402-sol',
    },
    types: {
      AuthorizationPayload: [
        { name: 'amount', type: 'string' },
        { name: 'recipient', type: 'string' },
        { name: 'resourceId', type: 'string' },
        { name: 'resourceUrl', type: 'string' },
        { name: 'nonce', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'expiry', type: 'uint64' },
      ],
    },
    primaryType: 'AuthorizationPayload',
    message: {
      amount: payload.amount,
      recipient: payload.recipient,
      resourceId: payload.resourceId,
      resourceUrl: payload.resourceUrl,
      nonce: payload.nonce,
      timestamp: payload.timestamp,
      expiry: payload.expiry,
    },
  };

  // Sign the structured data
  const messageToSign = JSON.stringify(structuredData);
  // Convert to Uint8Array (browser-compatible)
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(messageToSign);

  console.log('📝 Signing message for payment authorization...');
  const authSignature = await wallet.signMessage(messageBytes);
  console.log('✅ Signature received:', authSignature);
  console.log('   Type:', typeof authSignature);
  console.log('   IsUint8Array:', authSignature instanceof Uint8Array);
  console.log('   Length:', authSignature?.length);

  // Create Solana transaction
  const { blockhash } = await connection.getLatestBlockhash('confirmed');
  
  const transaction = new Transaction({
    feePayer: new PublicKey(requirements.facilitator),
    recentBlockhash: blockhash,
  });

  // Add transfer instruction: Client → Merchant
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: new PublicKey(requirements.recipient),
      lamports: Number(requirements.amount),
    })
  );

  // Sign the transaction
  const signedTransaction = await wallet.signTransaction(transaction);

  // Serialize the transaction
  const serializedTransaction = signedTransaction
    .serialize({
      requireAllSignatures: false, // Facilitator hasn't signed yet
      verifySignatures: true,
    })
    .toString('base64');

  // Encode signature - ensure it's a Uint8Array
  let encodedSignature: string;
  try {
    if (!(authSignature instanceof Uint8Array)) {
      console.error('❌ authSignature is not Uint8Array:', authSignature);
      throw new Error('Signature must be Uint8Array');
    }

    // Debug: Show first 10 bytes and check for invalid values
    console.log('🔍 Signature bytes (first 10):', Array.from(authSignature.slice(0, 10)));
    console.log('🔍 Signature bytes (last 10):', Array.from(authSignature.slice(-10)));
    console.log('🔍 All bytes in valid range (0-255)?', Array.from(authSignature).every(b => b >= 0 && b <= 255));

    // Ensure we have a plain Uint8Array (not a subclass or wrapped version)
    // This handles cases where Phantom might return a modified Uint8Array
    const plainSignature = new Uint8Array(authSignature);
    console.log('🔄 Created plain Uint8Array, length:', plainSignature.length);

    // Attempt encoding with detailed error handling
    console.log('🔄 Attempting bs58.encode...');
    encodedSignature = bs58.encode(plainSignature);
    console.log('✅ Signature encoded to base58:', encodedSignature.substring(0, 20) + '...');
    console.log('✅ Full encoded length:', encodedSignature.length);
  } catch (error) {
    console.error('❌ Failed to encode signature:', error);
    console.error('   Error name:', (error as Error).name);
    console.error('   Error message:', (error as Error).message);
    console.error('   Signature constructor:', authSignature.constructor.name);
    console.error('   Signature value (hex):', Array.from(authSignature).map(b => b.toString(16).padStart(2, '0')).join(''));
    throw error;
  }

  return {
    payload: payload,
    signature: encodedSignature,
    clientPublicKey: wallet.publicKey.toString(),
    signedTransaction: serializedTransaction,
  };
}

/**
 * Parse 402 response to extract payment requirements
 */
export function parsePaymentRequirements(response402: Response, body: any): PaymentRequirements {
  if (!body.recipient || !body.amount || !body.facilitator) {
    throw new Error('Invalid 402 response: missing payment requirements');
  }

  return {
    amount: body.amount,
    recipient: body.recipient,
    facilitator: body.facilitator,
    protocol: body.protocol || 'x402',
  };
}
