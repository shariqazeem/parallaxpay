import { Request, Response, NextFunction } from 'express';

/**
 * x402 Payment Middleware
 *
 * This middleware implements the x402 protocol (HTTP 402 Payment Required)
 * for Solana blockchain payments with facilitator-based verification.
 *
 * Flow:
 * 1. Check if request has X-Payment header
 * 2. If no payment, return 402 with payment requirements
 * 3. If payment exists, forward to facilitator for verification
 * 4. Forward to facilitator for settlement (broadcasts transaction)
 * 5. If valid, allow request to proceed
 *
 * TESTING: Set DISABLE_X402=true in .env to bypass payment checks
 */
export async function x402Middleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // BYPASS for testing - remove in production!
  if (process.env.DISABLE_X402 === 'true') {
    console.log('⚠️  X402 DISABLED - Allowing free access for testing');
    return next();
  }

  const paymentHeader = req.headers['x-payment'] as string;

  // If no payment header, return 402 Payment Required
  if (!paymentHeader) {
    return res.status(402).json({
      error: 'Payment Required',
      protocol: 'x402',
      recipient: process.env.PROVIDER_WALLET_ADDRESS || '9qzmG8vPymc2CAMchZgq26qiUFq4pEfTx6HZfpMhh51y',
      amount: '10000000', // 0.01 SOL in lamports
      facilitator: process.env.FACILITATOR_URL || 'http://localhost:3002',
      instructions: [
        '1. Create Solana transaction (client → provider)',
        '2. Sign transaction with your wallet',
        '3. Sign authorization payload',
        '4. Send both in X-Payment header',
        '5. Retry request'
      ]
    });
  }

  try {
    // Parse payment
    const payment = JSON.parse(paymentHeader);

    console.log('🔍 Verifying payment with facilitator...');

    // Forward to facilitator for verification
    const facilitatorUrl = process.env.FACILITATOR_URL || 'http://localhost:3002';
    const verifyResponse = await fetch(`${facilitatorUrl}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentRequest: JSON.stringify(payment) })
    });

    if (!verifyResponse.ok) {
      return res.status(402).json({
        error: 'Payment verification failed',
        details: await verifyResponse.text()
      });
    }

    const verifyData = await verifyResponse.json() as any;

    if (!verifyData.success || !verifyData.data?.verified) {
      return res.status(402).json({
        error: 'Invalid payment'
      });
    }

    console.log('💰 Settling payment with facilitator...');

    // Forward to facilitator for settlement
    const settleResponse = await fetch(`${facilitatorUrl}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentRequest: JSON.stringify(payment) })
    });

    if (!settleResponse.ok) {
      return res.status(402).json({
        error: 'Payment settlement failed'
      });
    }

    const settleData = await settleResponse.json() as any;

    if (!settleData.success) {
      return res.status(402).json({
        error: 'Transaction broadcast failed'
      });
    }

    console.log('✅ Payment settled:', settleData.data?.transactionSignature);

    // Payment verified and settled - allow request
    (req as any).paymentProof = settleData.data?.transactionSignature;
    next();

  } catch (error: any) {
    console.error('❌ x402 middleware error:', error);
    return res.status(500).json({
      error: 'Payment processing error',
      message: error.message
    });
  }
}
