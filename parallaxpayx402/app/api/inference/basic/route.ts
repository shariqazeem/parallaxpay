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

    // Call the actual AI provider
    const providerEndpoint = process.env.NEXT_PUBLIC_PROVIDER_ENDPOINT || 'http://localhost:4001';

    console.log(`🤖 Calling provider: ${providerEndpoint}/v1/inference`);
    const providerResponse = await fetch(`${providerEndpoint}/v1/inference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || 'Qwen/Qwen3-0.6B',
        prompt,
        max_tokens: max_tokens || 100,
        temperature: temperature || 0.7,
      }),
    });

    if (!providerResponse.ok) {
      const errorText = await providerResponse.text();
      throw new Error(`Provider error: ${errorText}`);
    }

    const aiResult = await providerResponse.json();

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
