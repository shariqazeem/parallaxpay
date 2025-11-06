import { NextRequest, NextResponse } from 'next/server';
import { Connection } from '@solana/web3.js';

/**
 * Protected API Route using Corbits x402 Protocol
 *
 * This demonstrates server-side x402 payment verification on Solana.
 * In production, you'd use Corbits middleware for Express/Hono, but Next.js
 * Edge middleware has limitations, so we implement it manually here.
 *
 * Flow:
 * 1. Client requests without payment → 402 Payment Required
 * 2. Client creates payment with Corbits → retries with X-Payment header
 * 3. Server verifies payment → returns protected content
 */

// USDC on Solana devnet
const USDC_DEVNET = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

export async function GET(request: NextRequest) {
  console.log('🔍 API Route called')
  console.log('📋 All headers:', Object.fromEntries(request.headers.entries()))

  const xPaymentHeader = request.headers.get('x-payment');
  console.log('💳 X-Payment header:', xPaymentHeader ? 'present' : 'MISSING')

  // No payment provided → Return 402 Payment Required
  if (!xPaymentHeader) {
    console.log('⚠️ No payment header - returning 402')
    // Return proper x402 format that Corbits expects
    return NextResponse.json(
      {
        x402Version: 1,
        accepts: [
          {
            scheme: 'exact',
            network: 'solana-devnet',
            asset: USDC_DEVNET, // Token mint address as string
            payTo: '9qzmG8vPymc2CAMchZgq26qiUFq4pEfTx6HZfpMhh51y',
            maxAmountRequired: '10000', // $0.01 in USDC (6 decimals)
            maxTimeoutSeconds: 300, // 5 minutes to complete payment
            mimeType: 'application/json', // Content type we'll return
            resource: request.url,
            description: 'Protected API access - Demo endpoint',
            extra: {
              // For demo: user's wallet pays transaction fees
              // In production with a facilitator, this would be the facilitator's address
              // Note: This is just a placeholder - Corbits will use the connected wallet
              feePayer: '11111111111111111111111111111111', // System program (placeholder)
            },
          },
        ],
      },
      { status: 402 }
    );
  }

  // Payment provided → Verify it
  console.log('✅ Payment header received! Verifying...')
  try {
    const paymentData = JSON.parse(
      Buffer.from(xPaymentHeader, 'base64').toString('utf-8')
    );

    console.log('💰 Payment data:', JSON.stringify(paymentData, null, 2));

    // In production, you would:
    // 1. Verify the transaction signature
    // 2. Check that the payment amount matches
    // 3. Verify the recipient is correct
    // 4. Check that the transaction is confirmed on-chain
    // 5. Store the transaction to prevent replay attacks

    // For this demo, we'll do basic validation
    if (!paymentData.payload?.transaction) {
      throw new Error('Invalid payment data');
    }

    // Verify transaction (simplified - in production use Corbits facilitator)
    const connection = new Connection('https://api.devnet.solana.com');
    const txBuffer = Buffer.from(paymentData.payload.transaction, 'base64');

    // In production, you'd submit this to the network and verify confirmation
    // For demo purposes, we'll accept it if it's properly formatted

    console.log('✅ Payment verified');

    // Return protected content
    return NextResponse.json({
      success: true,
      data: {
        message: '🎉 Payment successful! Here is your protected content.',
        timestamp: new Date().toISOString(),
        blockHeight: Math.floor(Math.random() * 1000000), // Mock data
        protectedData: {
          apiKey: 'demo-api-key-' + Math.random().toString(36),
          quota: 1000,
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        },
      },
    });

  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json(
      {
        error: 'Payment verification failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 402 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Same logic for POST requests
  return GET(request);
}
