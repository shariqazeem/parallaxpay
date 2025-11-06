'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Dynamically import WalletMultiButton to avoid SSR issues
const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

export interface WalletButtonProps {
  showBalance?: boolean
  balance?: number
  className?: string
}

export function WalletButton({ showBalance = false, balance, className }: WalletButtonProps) {
  const { publicKey } = useWallet()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={className || "px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-lg"}>
        <span className="opacity-50">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <WalletMultiButton className={className} />
      {showBalance && publicKey && balance !== undefined && (
        <div className="px-3 py-1 bg-green-500/20 border border-green-500 rounded text-green-300 text-xs">
          Balance: {balance.toFixed(4)} SOL
        </div>
      )}
    </div>
  )
}
