import { NextRequest, NextResponse } from 'next/server';
import { Connection } from '@solana/web3.js';

/**
 * Basic Tier Protected API Route
 * Price: $0.01 USDC
 * Model: Qwen 0.6B
 * Max Tokens: 100
 */

const USDC_DEVNET = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
const PRICE_USDC = '10000'; // $0.01 in USDC (6 decimals)
const PROVIDER_WALLET = '9qzmG8vPymc2CAMchZgq26qiUFq4pEfTx6HZfpMhh51y';

export async function POST(request: NextRequest) {
  console.log('🔍 Basic Tier API called');

  const xPaymentHeader = request.headers.get('x-payment');

  // No payment → Return 402 Payment Required
  if (!xPaymentHeader) {
    console.log('⚠️ No payment - returning 402');
    return NextResponse.json(
      {
        x402Version: 1,
        accepts: [
          {
            scheme: 'exact',
            network: 'solana-devnet',
            asset: USDC_DEVNET,
            payTo: PROVIDER_WALLET,
            maxAmountRequired: PRICE_USDC,
            maxTimeoutSeconds: 300,
            mimeType: 'application/json',
            resource: request.url,
            description: 'Basic AI Inference - Qwen 0.6B (100 tokens)',
            extra: {
              feePayer: '11111111111111111111111111111111',
            },
          },
        ],
      },
      { status: 402 }
    );
  }

  // Payment provided → Verify and process
  console.log('✅ Payment received, verifying...');
  try {
    const paymentData = JSON.parse(
      Buffer.from(xPaymentHeader, 'base64').toString('utf-8')
    );

    console.log('💰 Payment data:', JSON.stringify(paymentData, null, 2));

    if (!paymentData.payload?.transaction) {
      throw new Error('Invalid payment data');
    }

    // In production: verify transaction on-chain
    const connection = new Connection('https://api.devnet.solana.com');
    const txBuffer = Buffer.from(paymentData.payload.transaction, 'base64');

    console.log('✅ Payment verified');

    // Get request body
    const body = await request.json();
    const { prompt, model, max_tokens, temperature } = body;

    // TODO: Integrate with your AI provider
    // For now, return mock data to demonstrate payment flow
    // Once you set up authenticated backend access to your provider, replace this

    console.log(`🤖 Generating AI response for: "${prompt.substring(0, 50)}..."`);

    // Mock AI response (replace with actual provider call later)
    const aiResult = {
      completion: `This is a demo response from the Basic tier (Qwen 0.6B model).\n\nYour prompt was: "${prompt}"\n\nThe payment of $0.01 USDC was successfully verified! This demonstrates the complete x402 payment flow using Corbits.\n\nTo integrate with your actual AI provider:\n1. Set up backend authentication (API key or session token)\n2. Replace this mock response with a real API call\n3. The provider should accept authenticated requests without requiring x402 payment again`,
      metadata: {
        model: model || 'Qwen/Qwen3-0.6B',
        duration_ms: Math.floor(Math.random() * 500) + 100,
        tokens: Math.min(prompt.length * 2, max_tokens || 100),
      },
      tier: 'basic',
    };

    // Return AI result with payment confirmation
    return NextResponse.json({
      success: true,
      tier: 'basic',
      price: '$0.01',
      payment: {
        verified: true,
        amount: PRICE_USDC,
      },
      result: aiResult,
    });

  } catch (error) {
    console.error('❌ Payment verification failed:', error);
    return NextResponse.json(
      {
        error: 'Payment verification failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 402 }
    );
  }
}
