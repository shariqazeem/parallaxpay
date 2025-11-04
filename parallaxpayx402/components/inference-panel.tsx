'use client'

import { useState, useEffect } from 'react'

interface InferencePanelProps {
  provider: any
  onTransaction: (tx: any) => void
}

export function InferencePanel({ provider, onTransaction }: InferencePanelProps) {
  const [prompt, setPrompt] = useState('')
  const [selectedTier, setSelectedTier] = useState<'basic' | 'standard' | 'premium'>('standard')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [estimatedCost, setEstimatedCost] = useState(0)
  const [estimatedTokens, setEstimatedTokens] = useState(0)

  useEffect(() => {
    if (provider && prompt) {
      const promptLength = prompt.length
      const estimatedTokenCount = Math.ceil(promptLength / 4)

      const tierConfig = {
        basic: { max: 100, price: provider.pricing.tiers.basic.price_usd },
        standard: { max: 256, price: provider.pricing.tiers.standard.price_usd },
        premium: { max: 512, price: provider.pricing.tiers.premium.price_usd }
      }

      const config = tierConfig[selectedTier]
      const tokens = Math.min(estimatedTokenCount + 50, config.max)

      setEstimatedTokens(tokens)
      setEstimatedCost(config.price)
    }
  }, [prompt, selectedTier, provider])

  const handleGenerate = async () => {
    if (!prompt.trim() || !provider) return

    setLoading(true)
    setError(null)
    setResult(null)

    const startTime = Date.now()

    try {
      const tierConfig = {
        basic: 100,
        standard: 256,
        premium: 512
      }

      const response = await fetch(`${provider.url}/v1/inference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          max_tokens: tierConfig[selectedTier],
          temperature: 0.7
        })
      })

      if (response.status === 402) {
        const paymentInfo = await response.json()
        setError(`Payment required: $${paymentInfo.pricing[selectedTier].price}. Use the marketplace to enable automatic payments.`)

        onTransaction({
          timestamp: new Date().toISOString(),
          provider: provider.provider.name,
          tier: selectedTier,
          cost: estimatedCost,
          status: 'pending_payment',
          prompt: prompt.slice(0, 50) + '...'
        })

        return
      }

      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`)
      }

      const data = await response.json()
      const duration = Date.now() - startTime

      setResult(data)

      onTransaction({
        timestamp: new Date().toISOString(),
        provider: provider.provider.name,
        tier: selectedTier,
        cost: estimatedCost,
        tokens: data.tokens || estimatedTokens,
        duration,
        status: 'success',
        prompt: prompt.slice(0, 50) + '...',
        response: data.completion?.slice(0, 100) + '...'
      })

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)

      onTransaction({
        timestamp: new Date().toISOString(),
        provider: provider.provider.name,
        tier: selectedTier,
        cost: estimatedCost,
        status: 'failed',
        error: errorMsg,
        prompt: prompt.slice(0, 50) + '...'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!provider) {
    return (
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-12 border border-white/5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚡</span>
        </div>
        <p className="text-gray-500 text-sm mb-2">No provider selected</p>
        <p className="text-gray-700 text-xs">
          Select a provider from the sidebar to start generating
        </p>
      </div>
    )
  }

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">
            AI Inference
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Powered by {provider.capabilities.models[0]}
          </p>
        </div>
      </div>

      {/* Tier Selection */}
      <div className="mb-5">
        <label className="block text-white font-medium text-sm mb-3">
          Pricing Tier
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['basic', 'standard', 'premium'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`p-4 rounded-xl border transition-all ${
                selectedTier === tier
                  ? 'bg-purple-500/10 border-purple-500/30'
                  : 'bg-white/5 border-white/5 hover:bg-white/10'
              }`}
            >
              <div className="text-white font-semibold text-sm capitalize">{tier}</div>
              <div className="text-xs text-gray-500 mt-1">
                ${provider.pricing.tiers[tier].price_usd}
              </div>
              <div className="text-[10px] text-gray-600 mt-1">
                {provider.pricing.tiers[tier].max_tokens} tokens max
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="mb-5">
        <label className="block text-white font-medium text-sm mb-3">
          Your Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here... (e.g., 'Explain how Solana achieves sub-second finality')"
          className="w-full h-32 bg-black/40 text-white rounded-xl p-4 border border-white/10 focus:border-purple-500/50 focus:outline-none placeholder-gray-700 resize-none text-sm"
          disabled={loading}
        />

        {prompt && (
          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                ~{estimatedTokens} tokens
              </span>
              <span className="text-gray-700">•</span>
              <span className="text-white font-medium">
                ${estimatedCost.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || loading}
        className="w-full py-4 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-500 text-sm"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            Generating...
          </span>
        ) : (
          `Generate Response • $${estimatedCost.toFixed(2)}`
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 font-medium text-sm">Error</p>
          <p className="text-red-300 text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-5 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-emerald-400 font-semibold text-sm">Response Generated</h3>
            <span className="text-[10px] px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded">
              Success
            </span>
          </div>

          <div className="bg-black/40 rounded-lg p-4 mb-4">
            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
              {result.completion}
            </p>
          </div>

          {result.metadata && (
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-gray-600">Time</p>
                <p className="text-white font-medium mt-1">{result.metadata.duration_ms}ms</p>
              </div>
              <div>
                <p className="text-gray-600">Tokens</p>
                <p className="text-white font-medium mt-1">{result.tokens || estimatedTokens}</p>
              </div>
              <div>
                <p className="text-gray-600">Cost</p>
                <p className="text-white font-medium mt-1">${estimatedCost.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
