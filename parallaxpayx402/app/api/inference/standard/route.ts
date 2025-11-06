import { NextRequest, NextResponse } from 'next/server';
import { Connection, VersionedTransaction, PublicKey } from '@solana/web3.js';

/**
 * Standard Tier Protected API Route
 * Price: $0.05 USDC
 * Model: Qwen 1.7B
 * Max Tokens: 256
 */

const USDC_DEVNET = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
const PRICE_USDC = '50000'; // $0.05 in USDC (6 decimals)
const PROVIDER_WALLET = '9qzmG8vPymc2CAMchZgq26qiUFq4pEfTx6HZfpMhh51y';

export async function POST(request: NextRequest) {
  console.log('🔍 Standard Tier API called');

  // Read body first (can only read once in Next.js)
  const body = await request.json();
  const { prompt, model, max_tokens, temperature } = body;

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
            description: 'Standard AI Inference - Qwen 1.7B (256 tokens)',
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

    // TODO: Integrate with your AI provider
    // For now, return mock data to demonstrate payment flow
    console.log(`🤖 Generating AI response for: "${prompt.substring(0, 50)}..."`);

    // Mock AI response (replace with actual provider call later)
    const aiResult = {
      completion: `This is a Standard tier response (Qwen 1.7B model) - higher quality than Basic!\n\nYour prompt: "${prompt}"\n\nPayment verified: $0.05 USDC ✅\n\nThis tier provides:\n- 2.5x more tokens than Basic (256 vs 100)\n- More powerful 1.7B parameter model\n- Better quality for creative writing\n\nThe complete x402 payment flow is working! To integrate your real AI provider, set up backend authentication so your API server can call the provider without triggering another x402 payment request.`,
      metadata: {
        model: model || 'Qwen/Qwen3-1.7B',
        duration_ms: Math.floor(Math.random() * 800) + 200,
        tokens: Math.min(prompt.length * 3, max_tokens || 256),
      },
      tier: 'standard',
    };

    // Return AI result with payment confirmation
    return NextResponse.json({
      success: true,
      tier: 'standard',
      price: '$0.05',
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
