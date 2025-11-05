import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

// Simple in-memory session store (use Redis/DB in production)
const sessions = new Map<string, {
  resource: string;
  expiry: number;
  paymentProof?: string;
  createdAt: number;
}>()

/**
 * Session token endpoint for X402 payment flow
 * Called by x402-next middleware after successful payment verification
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // The x402-next middleware calls this after verifying payment
    const { paymentProof, resource } = body

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource is required' },
        { status: 400 }
      )
    }

    // Generate a cryptographically secure session token
    const sessionToken = randomBytes(32).toString('hex')
    const now = Date.now()

    // Store session with 1 hour expiry
    sessions.set(sessionToken, {
      resource,
      paymentProof,
      createdAt: now,
      expiry: now + (60 * 60 * 1000) // 1 hour
    })

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
      expiresIn: 3600, // 1 hour in seconds
    })
  } catch (error) {
    console.error('[ParallaxPay] Session token error:', error)
    return NextResponse.json(
      { error: 'Failed to create session token' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/x402/session-token?token=xxx
 * Verifies if a session token is valid
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    const session = sessions.get(token)

    if (!session) {
      return NextResponse.json(
        { valid: false, error: 'Invalid session' },
        { status: 401 }
      )
    }

    if (Date.now() > session.expiry) {
      sessions.delete(token)
      return NextResponse.json(
        { valid: false, error: 'Session expired' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      valid: true,
      resource: session.resource,
      paymentProof: session.paymentProof,
      createdAt: session.createdAt,
      expiresAt: session.expiry
    })
  } catch (error) {
    console.error('[ParallaxPay] Session verification failed:', error)
    return NextResponse.json(
      { valid: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}

/**
 * Cleanup expired sessions every 5 minutes
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    let cleanedCount = 0

    for (const [token, session] of sessions.entries()) {
      if (now > session.expiry) {
        sessions.delete(token)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`[ParallaxPay] Cleaned up ${cleanedCount} expired sessions`)
    }
  }, 5 * 60 * 1000)
}
