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
    // Fix for pino-pretty and other optional dependencies
    config.externals.push('pino-pretty', 'lokijs', 'encoding')

    // Fix for WalletConnect and Solana wallet adapters
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }

    return config
  },
}

export default nextConfig
