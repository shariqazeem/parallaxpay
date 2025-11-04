import { Address } from 'viem'
import { paymentMiddleware, Resource, Network } from 'x402-next'
import { NextRequest } from 'next/server'

const address = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS as Address
const network = process.env.NEXT_PUBLIC_NETWORK as Network
const facilitatorUrl = process.env.NEXT_PUBLIC_FACILITATOR_URL as Resource
const cdpClientKey = process.env.NEXT_PUBLIC_CDP_CLIENT_KEY as string

// Only enable x402 middleware if CDP key is configured
const x402PaymentMiddleware = cdpClientKey ? paymentMiddleware(
  address,
  {
    // ParallaxPay AI Inference Tiers
    '/content/basic': {
      price: '$0.01',
      config: {
        description: 'Basic AI Inference - Qwen 0.6B, 100 tokens',
      },
      network,
    },
    '/content/standard': {
      price: '$0.05',
      config: {
        description: 'Standard AI Inference - 256 tokens',
      },
      network,
    },
    '/content/premium': {
      price: '$0.25',
      config: {
        description: 'Premium AI Inference - 512 tokens',
      },
      network,
    },
  },
  {
    url: facilitatorUrl,
  },
  {
    cdpClientKey,
    appLogo: '/og-image.png',
    appName: 'ParallaxPay - AI Inference Marketplace',
    sessionTokenEndpoint: '/api/x402/session-token',
  },
) : null

export const middleware = (req: NextRequest) => {
  // If x402 middleware is not configured, allow all requests through
  if (!x402PaymentMiddleware) {
    return undefined
  }

  const delegate = x402PaymentMiddleware as unknown as (
    request: NextRequest,
  ) => ReturnType<typeof x402PaymentMiddleware>
  return delegate(req)
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Only match the protected content routes
    '/content/basic',
    '/content/standard',
    '/content/premium',
  ],
}
