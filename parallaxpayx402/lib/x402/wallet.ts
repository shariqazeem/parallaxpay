/**
 * X402 Wallet Interface for Browser Wallets
 * Supports Phantom and other standard Solana wallets
 */

import { Connection, PublicKey, Transaction, SystemProgram, Keypair, VersionedTransaction } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

export interface X402Wallet {
  publicKey: PublicKey;
  signTransaction(tx: Transaction): Promise<Transaction>;
  signMessage(message: Uint8Array): Promise<Uint8Array>;
}

// Legacy interface - use lib/corbits/wallet.ts for new code
export interface PhantomProvider {
  publicKey: PublicKey;
  isConnected: boolean;
  isPhantom?: boolean;
  connect(): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
  signMessage(message: Uint8Array, encoding: string): Promise<{ signature: Uint8Array }>;
}

// Commented out to avoid conflicts with Corbits wallet types
// declare global {
//   interface Window {
//     solana?: PhantomProvider;
//     phantom?: {
//       solana?: PhantomProvider;
//     };
//   }
// }

/**
 * Create wallet from Phantom browser extension
 */
export async function createPhantomWallet(): Promise<X402Wallet> {
  const provider = getPhantomProvider();
  
  if (!provider) {
    throw new Error('Phantom wallet not found. Please install Phantom wallet extension.');
  }

  if (!provider.isConnected) {
    await provider.connect();
  }

  return {
    publicKey: provider.publicKey,
    signTransaction: async (tx: Transaction) => {
      const signed = await provider.signTransaction(tx);
      return signed as Transaction;
    },
    signMessage: async (message: Uint8Array) => {
      // Phantom returns { signature: Uint8Array, publicKey: PublicKey }
      const response = await provider.signMessage(message, 'utf8');
      // Return the raw Uint8Array signature (not base58 encoded)
      return response.signature;
    }
  };
}

/**
 * Get Phantom provider (tries both window.solana and window.phantom.solana)
 * @deprecated Use lib/corbits/wallet.ts for new code
 */
function getPhantomProvider(): PhantomProvider | null {
  if (typeof window === 'undefined') return null;

  if ((window as any).phantom?.solana?.isPhantom) {
    return (window as any).phantom.solana as PhantomProvider;
  }

  if ((window as any).solana?.isPhantom) {
    return (window as any).solana as PhantomProvider;
  }

  return null;
}

/**
 * Check if Phantom wallet is installed
 */
export function isPhantomInstalled(): boolean {
  return getPhantomProvider() !== null;
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(
  connection: Connection,
  publicKey: PublicKey
): Promise<number> {
  const balance = await connection.getBalance(publicKey);
  return balance / 1e9; // Convert lamports to SOL
}
