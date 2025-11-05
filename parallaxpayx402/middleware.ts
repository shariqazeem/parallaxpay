// parallaxpayx402/middleware.ts

import { NextRequest, NextResponse } from 'next/server'

/**
 * Simple pass-through middleware
 * No payment gates - direct access to all content
 */
export const middleware = (req: NextRequest) => {
  return NextResponse.next()
}

export const config = {
  matcher: ['/content/:path*'],
}
