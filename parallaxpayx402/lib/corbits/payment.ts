/**
 * Corbits Payment Handler
 * Uses @faremeter packages for automatic x402 payments on Solana
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { createPaymentHandler } from '@faremeter/payment-solana/exact';
import { wrap as wrapFetch } from '@faremeter/fetch';
import { lookupKnownSPLToken } from '@faremeter/info/solana';
import type { CorbitsWallet } from './wallet';

export interface PaymentHandlerOptions {
  wallet: CorbitsWallet;
  connection: Connection;
  network: 'mainnet-beta' | 'devnet' | 'testnet';
  token?: 'USDC'; // Default: USDC (SOL not yet supported by lookupKnownSPLToken)
}

/**
 * Create a fetch function that automatically handles x402 payments
 * This wraps the standard fetch with Corbits payment handling
 */
export function createPaymentFetch(options: PaymentHandlerOptions) {
  const { wallet, connection, network, token = 'USDC' } = options;

  // Get USDC mint address for the network
  const tokenInfo = lookupKnownSPLToken(network, token);
  if (!tokenInfo) {
    throw new Error(`Couldn't look up ${token} on ${network}`);
  }

  const mint = new PublicKey(tokenInfo.address);

  // Create the payment handler
  const handler = createPaymentHandler(wallet, mint, connection);

  // Wrap fetch with payment handling
  const fetchWithPayer = wrapFetch(fetch, { handlers: [handler] });

  return fetchWithPayer;
}

/**
 * Simple helper to make a paid API request
 * Usage:
 * ```typescript
 * const wallet = await createPhantomCorbitsWallet('devnet');
 * const connection = new Connection(clusterApiUrl('devnet'));
 *
 * const result = await makePaymentRequest({
 *   wallet,
 *   connection,
 *   network: 'devnet',
 *   url: 'https://helius.api.corbits.dev',
 *   method: 'POST',
 *   body: { jsonrpc: '2.0', id: 1, method: 'getBlockHeight' }
 * });
 * ```
 */
export async function makePaymentRequest(options: {
  wallet: CorbitsWallet;
  connection: Connection;
  network: 'mainnet-beta' | 'devnet' | 'testnet';
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  token?: 'USDC'; // SOL not yet supported
}) {
  const {
    wallet,
    connection,
    network,
    url,
    method = 'GET',
    headers = {},
    body,
    token = 'USDC',
  } = options;

  // Create payment-enabled fetch
  const fetchWithPayer = createPaymentFetch({
    wallet,
    connection,
    network,
    token,
  });

  // Make the request (payment happens automatically on 402 response)
  const response = await fetchWithPayer(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Example: Call Helius API with automatic payment
 */
export async function callHeliusAPI(
  wallet: CorbitsWallet,
  connection: Connection,
  network: 'mainnet-beta' | 'devnet' | 'testnet',
  method: string,
  params: any[] = []
) {
  return makePaymentRequest({
    wallet,
    connection,
    network,
    url: 'https://helius.api.corbits.dev',
    method: 'POST',
    body: {
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    },
  });
}
