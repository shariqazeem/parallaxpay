// parallaxpayx402/middleware.ts

import { NextRequest, NextResponse } from 'next/server'

/**
 * X402 Payment Middleware Configuration
 *
 * TEMPORARY: x402 disabled for testing due to facilitator issues
 *
 * The x402 protocol integration is ready, but public facilitators
 * (x402.org and Corbits) are currently having issues:
 * - "Failed to get supported payment kinds: Not Found"
 * - This suggests the facilitator endpoints aren't fully compatible yet
 *
 * TO ENABLE X402 PAYMENTS:
 * 1. Uncomment the code at the bottom of this file
 * 2. Comment out the simple middleware below
 * 3. Restart the dev server
 *
 * For now, this allows you to test the AI inference functionality
 * without payment gates.
 */

export const middleware = (req: NextRequest) => {
  // Log the request for debugging
  console.log('[Middleware] Request:', req.nextUrl.pathname, '(x402 temporarily disabled)')

  // Allow all requests to pass through
  return NextResponse.next()
}

export const config = {
  matcher: ['/content/:path*'],
}

/*
 * UNCOMMENT THIS SECTION TO ENABLE X402 PAYMENTS
 * ================================================
 *
import { paymentMiddleware, Network } from 'x402-next'

// Your provider wallet address that will receive payments
const receiverAddress = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS || '9qzmG8vPymc2CAMchZgq26qiUFq4pEfTx6HZfpMhh51y'

// Network: solana-devnet for testing, solana-mainnet-beta for production
const network = (process.env.NEXT_PUBLIC_NETWORK as Network) || 'solana-devnet'

// Facilitator URL - requires a working Solana-compatible facilitator
const facilitatorUrl = process.env.NEXT_PUBLIC_FACILITATOR_URL || 'https://x402.org/facilitator'

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
*/
