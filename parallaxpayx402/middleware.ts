// parallaxpayx402/middleware.ts

import { NextRequest, NextResponse } from 'next/server'

/**
 * TEMPORARY: X402 middleware disabled for debugging
 * The x402-next package is causing "_bn" errors during payment processing
 * This might be due to:
 * 1. Incompatibility with Solana web3.js version
 * 2. CDP client key issues
 * 3. Network configuration problems
 *
 * For now, we're allowing free access to test the AI inference functionality
 * Once working, we'll re-enable X402 payments
 */

export const middleware = (req: NextRequest) => {
  // Allow all requests to pass through for now
  console.log('[ParallaxPay Middleware] Request:', req.nextUrl.pathname, '(Payment temporarily disabled)')
  return NextResponse.next()
}

export const config = {
  matcher: ['/content/:path*'],
}

/*
// ORIGINAL X402 CONFIGURATION (commented out for debugging)
import { Address } from 'viem'
import { paymentMiddleware, Resource, Network } from 'x402-next'

const address = '9qzmG8vPymc2CAMchZgq26qiUFq4pEfTx6HZfpMhh51y' as Address
const network = 'solana-devnet' as Network
const facilitatorUrl = 'https://x402.org/facilitator' as Resource
const cdpClientKey = '3uyu43EHCwgVIQx6a8cIfSkxp6cXgU30'

const x402PaymentMiddleware = paymentMiddleware(
  address,
  {
    '/content/basic': {
      price: '$0.01',
      config: {
        description: 'Basic AI Inference - Qwen 0.6B (100 tokens)',
      },
      network,
    },
    '/content/standard': {
      price: '$0.10',
      config: {
        description: 'Standard AI Inference - Qwen 7B (500 tokens)',
      },
      network,
    },
    '/content/premium': {
      price: '$0.50',
      config: {
        description: 'Premium AI Inference - Qwen 72B (2000 tokens)',
      },
      network,
    },
  },
  {
    url: facilitatorUrl,
  },
  {
    cdpClientKey,
    appLogo: '/logo.png',
    appName: 'ParallaxPay',
    sessionTokenEndpoint: '/api/x402/session-token',
  },
)

export const middleware = (req: NextRequest) => {
  if (!req.nextUrl.pathname.startsWith('/content/')) {
    return NextResponse.next()
  }

  const delegate = x402PaymentMiddleware as unknown as (
    request: NextRequest,
  ) => ReturnType<typeof x402PaymentMiddleware>

  return delegate(req)
}
*/