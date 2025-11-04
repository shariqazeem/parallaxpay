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

  useEffect(() => {
    discoverProviders()
    const interval = setInterval(discoverProviders, 30000)
    return () => clearInterval(interval)
  }, [])

  const discoverProviders = async () => {
    try {
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
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  AI Marketplace
                </h1>
                <p className="text-gray-500 text-xs">
                  Decentralized inference on Solana
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10 text-sm"
            >
              ← Home
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Providers */}
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-5 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${providers.length > 0 ? 'bg-emerald-400' : 'bg-gray-600'} ${providers.length > 0 ? 'animate-pulse' : ''}`}></span>
                  Providers
                </h2>
                <button
                  onClick={discoverProviders}
                  className="text-xs px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded transition-colors"
                >
                  Scan
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
                  <p className="text-gray-600 text-xs mt-3">Scanning...</p>
                </div>
              ) : providers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto mb-3">
                    <span className="text-gray-600">📡</span>
                  </div>
                  <p className="text-gray-600 text-xs">No providers found</p>
                </div>
              ) : (
                <div className="space-y-2">
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
            </div>

            {/* Stats */}
            {selectedProvider && (
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-5 border border-white/5">
                <h3 className="text-sm font-semibold text-white mb-4">
                  Statistics
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Success Rate</span>
                      <span className="text-sm text-white font-medium">
                        {selectedProvider.reputation.success_rate.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{width: `${selectedProvider.reputation.success_rate}%`}}></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <span className="text-xs text-gray-500">Response Time</span>
                    <span className="text-sm text-white font-medium">
                      {selectedProvider.reputation.avg_response_time_ms}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <span className="text-xs text-gray-500">Transactions</span>
                    <span className="text-sm text-white font-medium">
                      {selectedProvider.reputation.total_transactions}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <span className="text-xs text-gray-500">Rating</span>
                    <span className="text-sm text-white font-medium">
                      {selectedProvider.reputation.rating.toFixed(1)} ⭐
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main */}
          <div className="lg:col-span-3 space-y-6">
            <InferencePanel
              provider={selectedProvider}
              onTransaction={addTransaction}
            />

            {transactions.length > 0 && (
              <TransactionHistory transactions={transactions} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
