import { Request, Response, NextFunction } from 'express';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { verifyPayment } from '../services/payment-verifier';

/**
 * x402 Payment Middleware
 *
 * This middleware implements the x402 protocol (HTTP 402 Payment Required)
 * for Solana blockchain payments.
 *
 * Flow:
 * 1. Check if request has X-Payment header
 * 2. If no payment, return 402 with payment requirements
 * 3. If payment exists, verify it on-chain
 * 4. If valid, allow request to proceed
 */
export async function x402Middleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const paymentHeader = req.headers['x-payment'] as string;

  // If no payment header, return 402 Payment Required
  if (!paymentHeader) {
    return res.status(402).json({
      error: 'Payment Required',
      protocol: 'x402',
      network: process.env.NETWORK || 'devnet',
      recipient: req.app.locals.providerWallet.publicKey.toBase58(),
      pricing: {
        basic: {
          price: parseFloat(process.env.BASIC_PRICE || '0.01'),
          max_tokens: 100,
          description: 'Basic tier inference'
        },
        standard: {
          price: parseFloat(process.env.STANDARD_PRICE || '0.05'),
          max_tokens: 256,
          description: 'Standard tier inference'
        },
        premium: {
          price: parseFloat(process.env.PREMIUM_PRICE || '0.25'),
          max_tokens: 512,
          description: 'Premium tier inference'
        }
      },
      facilitator: process.env.FACILITATOR_URL,
      instructions: [
        '1. Create a Solana transaction sending USDC to the recipient',
        '2. Include the payment details in the X-Payment header',
        '3. Retry your request with the payment header'
      ]
    });
  }

  try {
    // Parse payment data
    const paymentData = JSON.parse(paymentHeader);

    console.log('🔍 Verifying payment...', paymentData);

    // Verify payment via facilitator or directly on-chain
    const connection = req.app.locals.connection as Connection;
    const providerWallet = req.app.locals.providerWallet;

    const isValid = await verifyPayment(
      connection,
      paymentData,
      providerWallet.publicKey
    );

    if (!isValid) {
      return res.status(402).json({
        error: 'Payment verification failed',
        message: 'Transaction could not be verified on-chain'
      });
    }

    console.log('✅ Payment verified successfully');

    // Payment is valid, proceed to next middleware/handler
    next();

  } catch (error: any) {
    console.error('❌ Payment verification error:', error);
    return res.status(402).json({
      error: 'Payment verification failed',
      message: error.message
    });
  }
}
