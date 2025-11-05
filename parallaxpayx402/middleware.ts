// parallaxpayx402/middleware.ts

import { NextRequest } from 'next/server'
import { paymentMiddleware, Network } from 'x402-next'

/**
 * X402 Payment Middleware Configuration
 *
 * This middleware implements the x402 protocol for Solana payments.
 * When a user tries to access protected content (/content/*), they must pay.
 *
 * Flow:
 * 1. User requests /content/basic (or standard/premium)
 * 2. Middleware checks for payment session
 * 3. If no session, returns 402 with Coinbase Pay modal
 * 4. User pays with USDC on Solana devnet
 * 5. Facilitator verifies payment on-chain
 * 6. Session created, user gets access
 */

// Your provider wallet address that will receive payments
const receiverAddress = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS || '9qzmG8vPymc2CAMchZgq26qiUFq4pEfTx6HZfpMhh51y'

// Network: solana-devnet for testing, solana-mainnet-beta for production
const network = (process.env.NEXT_PUBLIC_NETWORK as Network) || 'solana-devnet'

// Facilitator URL - using Corbits facilitator for Solana support
const facilitatorUrl = process.env.NEXT_PUBLIC_FACILITATOR_URL || 'https://facilitator.corbits.dev'

// CDP Client Key for Coinbase Pay
const cdpClientKey = process.env.NEXT_PUBLIC_CDP_CLIENT_KEY || '3uyu43EHCwgVIQx6a8cIfSkxp6cXgU30'

// Configure payment middleware with three pricing tiers
const x402PaymentMiddleware = paymentMiddleware(
  receiverAddress as any,
  {
    '/content/basic': {
      price: '$0.01',
      config: {
        description: 'Basic AI Inference - Qwen 0.6B (100 tokens)',
        maxTimeoutSeconds: 120,
      },
      network,
    },
    '/content/standard': {
      price: '$0.05',
      config: {
        description: 'Standard AI Inference - Qwen 7B (256 tokens)',
        maxTimeoutSeconds: 120,
      },
      network,
    },
    '/content/premium': {
      price: '$0.25',
      config: {
        description: 'Premium AI Inference - Qwen 72B (512 tokens)',
        maxTimeoutSeconds: 180,
      },
      network,
    },
  },
  {
    url: facilitatorUrl as any,
  },
  {
    cdpClientKey,
    appLogo: '/logo.png',
    appName: 'ParallaxPay',
    sessionTokenEndpoint: '/api/x402/session-token',
  },
)

export const middleware = (req: NextRequest) => {
  console.log('[x402] Processing request:', req.nextUrl.pathname)

  const delegate = x402PaymentMiddleware as unknown as (
    request: NextRequest,
  ) => ReturnType<typeof x402PaymentMiddleware>

  return delegate(req)
}

export const config = {
  matcher: ['/content/:path*'],
}
