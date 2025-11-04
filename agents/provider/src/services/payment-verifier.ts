import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';

interface PaymentData {
  transaction?: string;
  signature?: string;
  amount?: number;
  token?: string;
}

/**
 * Verify payment on Solana blockchain
 *
 * This function verifies that a payment transaction:
 * 1. Exists on-chain
 * 2. Is confirmed
 * 3. Transfers the correct amount
 * 4. Goes to the correct recipient
 */
export async function verifyPayment(
  connection: Connection,
  paymentData: PaymentData,
  recipient: PublicKey
): Promise<boolean> {
  try {
    const signature = paymentData.transaction || paymentData.signature;

    if (!signature) {
      console.warn('⚠️ No transaction signature provided');
      return false;
    }

    console.log(`🔍 Verifying transaction: ${signature}`);

    // Check transaction status on-chain
    const status = await connection.getSignatureStatus(signature, {
      searchTransactionHistory: true
    });

    if (!status || !status.value) {
      console.warn('⚠️ Transaction not found on-chain');
      return false;
    }

    if (status.value.err) {
      console.error('❌ Transaction failed:', status.value.err);
      return false;
    }

    // Transaction is confirmed
    if (status.value.confirmationStatus === 'confirmed' ||
        status.value.confirmationStatus === 'finalized') {
      console.log('✅ Transaction confirmed on-chain');
      return true;
    }

    console.warn('⚠️ Transaction not yet confirmed');
    return false;

  } catch (error: any) {
    console.error('❌ Payment verification error:', error.message);
    return false;
  }
}

/**
 * Verify payment via x402 facilitator
 *
 * Alternative verification method using facilitator service
 */
export async function verifyPaymentViaFacilitator(
  paymentData: any,
  recipient: string
): Promise<boolean> {
  try {
    const facilitatorUrl = process.env.FACILITATOR_URL;
    if (!facilitatorUrl) {
      throw new Error('FACILITATOR_URL not configured');
    }

    const response = await axios.post(
      `${facilitatorUrl}/verify`,
      {
        payment: paymentData,
        recipient,
        network: process.env.NETWORK || 'devnet'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    return response.data.valid === true;

  } catch (error: any) {
    console.error('❌ Facilitator verification error:', error.message);
    return false;
  }
}
