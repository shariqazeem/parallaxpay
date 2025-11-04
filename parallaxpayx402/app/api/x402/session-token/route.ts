import { NextRequest, NextResponse } from 'next/server'

/**
 * Session token endpoint for X402 payment flow
 * Called by x402-next middleware after successful payment verification
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // The x402-next middleware calls this after verifying payment
    const { paymentProof, resource } = body

    // Generate a simple session token
    const sessionToken = `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`

    console.log('[ParallaxPay] Session token created:', {
      token: sessionToken.substring(0, 15) + '...',
      resource,
      timestamp: new Date().toISOString(),
    })

    // In production, you would:
    // 1. Store this in Redis/Database with TTL
    // 2. Associate with user/payment details
    // 3. Track usage for analytics

    return NextResponse.json({
      success: true,
      sessionToken,
      expiresIn: 3600, // 1 hour
    })
  } catch (error) {
    console.error('[ParallaxPay] Session token error:', error)
    return NextResponse.json(
      { error: 'Failed to create session token' },
      { status: 500 }
    )
  }
}
