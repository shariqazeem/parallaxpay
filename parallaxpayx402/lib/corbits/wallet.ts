/**
 * Corbits Wallet Integration for Phantom
 * Implements the Faremeter wallet interface for browser wallets
 */

import { PublicKey, VersionedTransaction, Connection } from '@solana/web3.js';

// Corbits Wallet Interface (from @faremeter/payment-solana docs)
export interface CorbitsWallet {
  network: string;
  publicKey: PublicKey;
  updateTransaction?: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
  buildTransaction?: (
    instructions: any[],
    recentBlockHash: string
  ) => Promise<VersionedTransaction>;
  sendTransaction?: (tx: VersionedTransaction) => Promise<string>;
}

export interface PhantomProvider {
  publicKey: PublicKey;
  isConnected: boolean;
  isPhantom?: boolean;
  connect(): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  signTransaction<T extends VersionedTransaction>(transaction: T): Promise<T>;
  signMessage(message: Uint8Array, encoding: string): Promise<{ signature: Uint8Array }>;
}

declare global {
  interface Window {
    solana?: PhantomProvider;
    phantom?: {
      solana?: PhantomProvider;
    };
  }
}

/**
 * Create Corbits-compatible wallet from Phantom browser extension
 */
export async function createPhantomCorbitsWallet(
  network: 'mainnet-beta' | 'devnet' | 'testnet'
): Promise<CorbitsWallet> {
  const provider = getPhantomProvider();

  if (!provider) {
    throw new Error('Phantom wallet not found. Please install Phantom wallet extension.');
  }

  if (!provider.isConnected) {
    await provider.connect();
  }

  return {
    network, // Use raw cluster name (Corbits converts internally to x402 format)
    publicKey: provider.publicKey,
    updateTransaction: async (tx: VersionedTransaction) => {
      // Phantom signs the transaction
      const signedTx = await provider.signTransaction(tx);
      return signedTx;
    },
  };
}

/**
 * Get Phantom provider (tries both window.solana and window.phantom.solana)
 */
function getPhantomProvider(): PhantomProvider | null {
  if (typeof window === 'undefined') return null;

  if (window.phantom?.solana?.isPhantom) {
    return window.phantom.solana;
  }

  if (window.solana?.isPhantom) {
    return window.solana as PhantomProvider;
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
