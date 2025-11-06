import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.giphy.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'pino-pretty' on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'pino-pretty': false,
      }
    }
    return config
  },
}

export default nextConfig
