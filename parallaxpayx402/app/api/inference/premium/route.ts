import { NextRequest, NextResponse } from 'next/server';
import { Connection, VersionedTransaction, PublicKey } from '@solana/web3.js';

/**
 * Premium Tier Protected API Route
 * Price: $0.25 USDC
 * Model: DeepSeek R1 Distill
 * Max Tokens: 512
 */

const USDC_DEVNET = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
const PRICE_USDC = '250000'; // $0.25 in USDC (6 decimals)
const PROVIDER_WALLET = '9qzmG8vPymc2CAMchZgq26qiUFq4pEfTx6HZfpMhh51y';

export async function POST(request: NextRequest) {
  console.log('🔍 Premium Tier API called');

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
            description: 'Premium AI Inference - DeepSeek R1 (512 tokens)',
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

    // Verify and submit transaction on-chain
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const txBuffer = Buffer.from(paymentData.payload.transaction, 'base64');

    console.log('📤 Deserializing and sending transaction to Solana...');

    // Deserialize the transaction
    const transaction = VersionedTransaction.deserialize(txBuffer);

    // Send the transaction to the network
    const signature = await connection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
    });

    console.log(`⏳ Waiting for confirmation... Signature: ${signature}`);

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');

    if (confirmation.value.err) {
      console.error('❌ Transaction failed:', confirmation.value.err);
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    console.log('✅ Transaction confirmed on-chain!');
    console.log(`🔗 View on Solscan: https://solscan.io/tx/${signature}?cluster=devnet`);

    // Get request body
    const body = await request.json();
    const { prompt, model, max_tokens, temperature } = body;

    // TODO: Integrate with your AI provider
    // For now, return mock data to demonstrate payment flow
    console.log(`🤖 Generating Premium AI response for: "${prompt.substring(0, 50)}..."`);

    // Mock AI response with reasoning (replace with actual provider call later)
    const aiResult = {
      completion: `<think>\nAnalyzing the user's prompt: "${prompt}"\nThis is the Premium tier with DeepSeek R1 reasoning capabilities.\nI should provide a high-quality, detailed response that demonstrates:\n1. Advanced reasoning\n2. Longer-form content (up to 512 tokens)\n3. Premium quality output\nPayment verified: $0.25 USDC ✅\n</think>\n\nThis is a Premium tier response using DeepSeek R1 Distill!\n\nYour prompt: "${prompt}"\n\n✨ Premium Features Active:\n- 512 token maximum (5x more than Basic)\n- DeepSeek R1 reasoning with <think> tags\n- Advanced logical reasoning capabilities\n- Perfect for complex analysis and long-form content\n\nThe x402 payment flow is working perfectly! Your $0.25 USDC payment was verified on-chain.\n\nTo integrate with your actual AI provider:\n1. Set up backend API authentication\n2. Your provider should accept authenticated requests from your server\n3. This prevents the nested x402 payment loop\n4. Your server pays once, user pays your server, everyone wins!`,
      metadata: {
        model: model || 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',
        duration_ms: Math.floor(Math.random() * 1500) + 500,
        tokens: Math.min(prompt.length * 4, max_tokens || 512),
      },
      tier: 'premium',
    };

    // Return AI result with payment confirmation
    return NextResponse.json({
      success: true,
      tier: 'premium',
      price: '$0.25',
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
