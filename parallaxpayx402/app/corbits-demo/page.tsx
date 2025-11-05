'use client'

import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import { VersionedTransaction } from '@solana/web3.js'
import { createPaymentFetch } from '@/lib/corbits'
import type { CorbitsWallet } from '@/lib/corbits'

// Import WalletMultiButton dynamically to avoid hydration issues
const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

export default function CorbitsDemoPage() {
  const [mounted, setMounted] = useState(false)
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()

  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // Prevent hydration errors by only rendering on client
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleTestPayment = async () => {
    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError('')
    setResult('')

    try {
      // Create Corbits-compatible wallet from Solana Wallet Adapter
      const corbitsWallet: CorbitsWallet = {
        network: 'devnet',
        publicKey,
        updateTransaction: async (tx: VersionedTransaction) => {
          const signedTx = await signTransaction(tx)
          return signedTx as VersionedTransaction
        },
      }

      // Create payment-enabled fetch
      const fetchWithPayer = createPaymentFetch({
        wallet: corbitsWallet,
        connection,
        network: 'devnet',
        token: 'USDC',
      })

      // Make a paid API call to our protected endpoint
      // Note: Using local endpoint to avoid CORS issues
      // In production, you'd use a proper x402-enabled API
      const response = await fetchWithPayer('/api/corbits-protected', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))

    } catch (err) {
      console.error('Payment error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Prevent hydration errors
  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            Corbits x402 Demo
          </h1>
          <p className="text-gray-400 text-lg">
            Automatic micropayments for APIs on Solana
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-white/5">
          {/* Wallet Connection */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Test Payment Flow</h2>
              <p className="text-gray-500 text-sm">
                Connect your wallet and click the button below to make a paid API call
              </p>
            </div>
            <WalletMultiButton className="!bg-purple-500 hover:!bg-purple-600 !rounded-xl" />
          </div>

          {/* Connection Status */}
          {!publicKey && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-amber-400 font-medium">⚠️ Wallet Not Connected</p>
              <p className="text-amber-300 text-sm mt-1">
                Please connect your Phantom wallet to continue
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-blue-400 font-medium mb-2">ℹ️ How it works</p>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• Calls protected API endpoint (/api/corbits-protected)</li>
              <li>• API returns 402 Payment Required</li>
              <li>• Corbits automatically creates USDC payment transaction</li>
              <li>• You sign the transaction in Phantom</li>
              <li>• API verifies payment and returns protected content</li>
            </ul>
            <p className="text-blue-400/70 text-xs mt-2">
              Note: Using local endpoint to avoid CORS issues. In production, you'd use external x402-enabled APIs.
            </p>
          </div>

          {/* Test Button */}
          <button
            onClick={handleTestPayment}
            disabled={!publicKey || loading}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg mb-6"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                Processing Payment...
              </span>
            ) : (
              '🚀 Make Paid API Call'
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 font-medium">❌ Error</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-emerald-400 font-medium mb-3">✅ Success - Payment Complete!</p>
              <div className="bg-black/40 rounded-lg p-4 overflow-auto max-h-96">
                <pre className="text-emerald-300 text-xs font-mono">
                  {result}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/5">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-bold mb-2">Automatic Payments</h3>
            <p className="text-gray-500 text-sm">
              No manual payment handling - Corbits detects 402 responses and pays automatically
            </p>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/5">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-lg font-bold mb-2">Secure & Non-Custodial</h3>
            <p className="text-gray-500 text-sm">
              You control your private keys - payments are signed in your wallet
            </p>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/5">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="text-lg font-bold mb-2">Micropayments</h3>
            <p className="text-gray-500 text-sm">
              Pay only for what you use - perfect for AI APIs and data services
            </p>
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-12 bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/5">
          <h3 className="text-xl font-bold mb-4">Code Example</h3>
          <div className="bg-black rounded-lg p-4 overflow-auto">
            <pre className="text-sm text-gray-300">
{`import { createPaymentFetch } from '@/lib/corbits';

// Create wallet (from Phantom)
const wallet = {
  network: 'devnet',
  publicKey,
  updateTransaction: (tx) => signTransaction(tx),
};

// Create payment-enabled fetch
const fetchWithPayer = createPaymentFetch({
  wallet,
  connection,
  network: 'devnet',
  token: 'USDC',
});

// Make paid API call - payment happens automatically!
const response = await fetchWithPayer('https://api.example.com', {
  method: 'POST',
  body: JSON.stringify({ ... }),
});`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
