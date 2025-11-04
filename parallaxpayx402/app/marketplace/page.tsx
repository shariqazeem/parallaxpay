'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProviderCard } from '@/components/provider-card'
import { InferencePanel } from '@/components/inference-panel'
import { TransactionHistory } from '@/components/transaction-history'

interface Provider {
  url: string
  provider: {
    name: string
    address: string
    region: string
  }
  pricing: {
    tiers: {
      basic: { price_usd: number; max_tokens: number }
      standard: { price_usd: number; max_tokens: number }
      premium: { price_usd: number; max_tokens: number }
    }
  }
  reputation: {
    total_transactions: number
    success_rate: number
    avg_response_time_ms: number
    rating: number
  }
  capabilities: {
    models: string[]
    max_tokens: number
  }
}

export default function MarketplacePage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])

  // Discover providers on mount
  useEffect(() => {
    discoverProviders()
    const interval = setInterval(discoverProviders, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const discoverProviders = async () => {
    try {
      // Query known provider endpoints
      const providerUrls = [
        'http://localhost:4001',
        process.env.NEXT_PUBLIC_PROVIDER_ENDPOINT,
      ].filter(Boolean)

      const discovered = await Promise.all(
        providerUrls.map(async (url) => {
          try {
            const response = await fetch(`${url}/api/discovery`)
            if (response.ok) {
              const data = await response.json()
              return { url, ...data }
            }
          } catch (error) {
            console.warn(`Failed to discover provider at ${url}`)
          }
          return null
        })
      )

      const validProviders = discovered.filter(Boolean) as Provider[]
      setProviders(validProviders)

      // Auto-select best provider
      if (validProviders.length > 0 && !selectedProvider) {
        const best = validProviders.sort((a, b) =>
          b.reputation.rating - a.reputation.rating
        )[0]
        setSelectedProvider(best)
      }
    } catch (error) {
      console.error('Provider discovery failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTransaction = (tx: any) => {
    setTransactions(prev => [tx, ...prev].slice(0, 10))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                🤖 AI Marketplace
              </h1>
              <p className="text-gray-400 text-sm">
                Decentralized AI inference powered by Gradient Parallax
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Provider Discovery */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  Live Providers
                </h2>
                <button
                  onClick={discoverProviders}
                  className="text-sm px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded transition-colors"
                >
                  🔄 Refresh
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  <p className="text-gray-400 mt-2">Discovering providers...</p>
                </div>
              ) : providers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No providers found</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Make sure provider agent is running
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {providers.map((provider, i) => (
                    <ProviderCard
                      key={i}
                      provider={provider}
                      selected={selectedProvider?.url === provider.url}
                      onSelect={() => setSelectedProvider(provider)}
                    />
                  ))}
                </div>
              )}

              {providers.length > 0 && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-300 text-sm">
                    ✅ Found {providers.length} provider{providers.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-green-400/70 text-xs mt-1">
                    Autonomous discovery active
                  </p>
                </div>
              )}
            </div>

            {/* Stats */}
            {selectedProvider && (
              <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">
                  📊 Provider Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Success Rate</span>
                    <span className="text-white font-bold">
                      {selectedProvider.reputation.success_rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Avg Response</span>
                    <span className="text-white font-bold">
                      {selectedProvider.reputation.avg_response_time_ms}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Transactions</span>
                    <span className="text-white font-bold">
                      {selectedProvider.reputation.total_transactions}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Rating</span>
                    <span className="text-white font-bold">
                      {selectedProvider.reputation.rating.toFixed(1)}⭐
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Center: Inference Panel */}
          <div className="lg:col-span-2">
            <InferencePanel
              provider={selectedProvider}
              onTransaction={addTransaction}
            />

            {/* Transaction History */}
            <div className="mt-6">
              <TransactionHistory transactions={transactions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
