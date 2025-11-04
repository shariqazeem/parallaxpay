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

  // Calculate estimated cost and tokens based on prompt
  useEffect(() => {
    if (provider && prompt) {
      const promptLength = prompt.length
      const estimatedTokenCount = Math.ceil(promptLength / 4) // Rough estimate: 1 token ≈ 4 chars

      const tierConfig = {
        basic: { max: 100, price: provider.pricing.tiers.basic.price_usd },
        standard: { max: 256, price: provider.pricing.tiers.standard.price_usd },
        premium: { max: 512, price: provider.pricing.tiers.premium.price_usd }
      }

      const config = tierConfig[selectedTier]
      const tokens = Math.min(estimatedTokenCount + 50, config.max) // Add 50 for response

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

      // Call provider agent directly with x402 payment
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
        // Payment required - show payment modal
        const paymentInfo = await response.json()

        // In a real app, this would trigger Coinbase Pay or wallet connection
        // For demo, we'll show what would happen
        setError(`Payment Required: $${paymentInfo.pricing[selectedTier].price} - In production, Coinbase Pay would handle this automatically`)

        // Log transaction attempt
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

      // Log successful transaction
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

      // Log failed transaction
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
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
        <p className="text-gray-400 text-lg">👈 Select a provider to get started</p>
        <p className="text-gray-500 text-sm mt-2">
          Or start the provider agent if none are available
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          ⚡ AI Inference
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Powered by</span>
          <span className="text-sm font-bold text-purple-400">
            {provider.capabilities.models[0]}
          </span>
        </div>
      </div>

      {/* Tier Selection */}
      <div className="mb-4">
        <label className="block text-white font-semibold mb-2">
          Select Pricing Tier
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['basic', 'standard', 'premium'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`p-3 rounded-lg border transition-all ${
                selectedTier === tier
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-purple-500 shadow-lg'
                  : 'bg-white/5 border-white/20 hover:border-white/40'
              }`}
            >
              <div className="text-white font-bold capitalize">{tier}</div>
              <div className="text-sm text-gray-300 mt-1">
                ${provider.pricing.tiers[tier].price_usd}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {provider.pricing.tiers[tier].max_tokens} tokens
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="mb-4">
        <label className="block text-white font-semibold mb-2">
          Enter Your Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What would you like the AI to generate? (e.g., 'Explain quantum computing in simple terms')"
          className="w-full h-32 bg-white/10 text-white rounded-lg p-4 border border-white/30 focus:border-purple-400 focus:outline-none placeholder-white/50 resize-none"
          disabled={loading}
        />

        {/* Cost Estimate */}
        {prompt && (
          <div className="mt-2 flex items-center justify-between text-sm">
            <div className="text-gray-400">
              Estimated: {estimatedTokens} tokens
            </div>
            <div className="text-white font-bold">
              Cost: ${estimatedCost.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || loading}
        className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            Processing x402 Payment & Inference...
          </span>
        ) : (
          `⚡ Generate AI Response ($${estimatedCost.toFixed(2)})`
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-200 font-semibold">❌ Error:</p>
          <p className="text-red-200 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="mt-6 p-6 bg-green-500/20 border border-green-500 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-green-300 font-bold text-lg">✅ AI Response Generated!</h3>
            <span className="text-xs px-2 py-1 bg-green-500 text-white rounded">
              Paid via x402
            </span>
          </div>

          <div className="bg-black/30 rounded p-4 mb-3">
            <p className="text-white whitespace-pre-wrap">
              {result.completion}
            </p>
          </div>

          {result.metadata && (
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-green-400/70">Processing Time</p>
                <p className="text-green-300 font-bold">{result.metadata.duration_ms}ms</p>
              </div>
              <div>
                <p className="text-green-400/70">Tokens Used</p>
                <p className="text-green-300 font-bold">{result.tokens || estimatedTokens}</p>
              </div>
              <div>
                <p className="text-green-400/70">Cost</p>
                <p className="text-green-300 font-bold">${estimatedCost.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
