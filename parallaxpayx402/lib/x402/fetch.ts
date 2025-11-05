/**
 * X402 Fetch Wrapper
 * Automatically handles 402 Payment Required responses
 * Inspired by Faremeter's approach but adapted for our facilitator
 */

import { Connection } from '@solana/web3.js';
import type { X402Wallet } from './wallet';
import { createPaymentRequest, parsePaymentRequirements } from './payment';

export interface X402FetchOptions {
  wallet: X402Wallet;
  connection: Connection;
  maxRetries?: number;
  onPaymentRequired?: (amount: number) => void;
  onPaymentCreated?: (txSignature: string) => void;
}

/**
 * Create a fetch wrapper that automatically handles 402 responses
 * Similar to @faremeter/fetch but for our x402 facilitator protocol
 */
export function createX402Fetch(options: X402FetchOptions) {
  const { wallet, connection, maxRetries = 1, onPaymentRequired, onPaymentCreated } = options;

  return async function fetchWithPayment(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    let url: string;
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else {
      url = input.url;
    }

    let attempts = 0;

    while (attempts <= maxRetries) {
      attempts++;

      // Make the initial request
      const response = await fetch(input, init);

      // If not 402, return the response
      if (response.status !== 402) {
        return response;
      }

      // This is a 402 Payment Required response
      if (attempts > maxRetries) {
        throw new Error('Max payment retries exceeded');
      }

      console.log('💳 Payment required, creating payment...');

      // Parse payment requirements from 402 response
      const body = await response.json();
      const requirements = parsePaymentRequirements(response, body);

      // Notify caller of payment requirement
      if (onPaymentRequired) {
        const amountSol = Number(requirements.amount) / 1e9;
        onPaymentRequired(amountSol);
      }

      // Create payment request
      const paymentRequest = await createPaymentRequest(
        wallet,
        requirements,
        url,
        connection
      );

      console.log('✅ Payment created, retrying request with X-Payment header...');

      // Retry the request with payment
      const retryResponse = await fetch(input, {
        ...init,
        headers: {
          ...init?.headers,
          'X-Payment': JSON.stringify(paymentRequest),
        },
      });

      // Notify caller of successful payment
      if (retryResponse.ok && onPaymentCreated) {
        // Try to extract transaction signature from response
        try {
          const retryBody = await retryResponse.clone().json();
          const txSig = retryBody.paymentProof || retryBody.transactionSignature;
          if (txSig) {
            onPaymentCreated(txSig);
          }
        } catch (e) {
          // Response might not be JSON, that's okay
        }
      }

      return retryResponse;
    }

    throw new Error('Payment failed after all retries');
  };
}

/**
 * Simple usage example:
 * 
 * ```typescript
 * const wallet = await createPhantomWallet();
 * const connection = new Connection('https://api.devnet.solana.com');
 * 
 * const fetchWithPayment = createX402Fetch({
 *   wallet,
 *   connection,
 *   onPaymentRequired: (amount) => console.log(`Payment required: ${amount} SOL`),
 *   onPaymentCreated: (txSig) => console.log(`Payment sent: ${txSig}`)
 * });
 * 
 * const response = await fetchWithPayment('http://localhost:4001/v1/inference', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ prompt: 'Hello', model: 'Qwen/Qwen3-0.6B' })
 * });
 * ```
 */
