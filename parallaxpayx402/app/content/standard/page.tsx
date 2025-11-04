'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function StandardInferencePage() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const providerEndpoint = process.env.NEXT_PUBLIC_PROVIDER_ENDPOINT || 'http://localhost:4001'

      const response = await fetch(`${providerEndpoint}/v1/inference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'Qwen/Qwen3-1.7B',
          prompt,
          max_tokens: 256,
          temperature: 0.8,
        }),
      })

      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border-2 border-purple-500">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 rounded-full text-white text-sm font-semibold mb-4">
              <span className="animate-pulse">⭐</span>
              Standard Tier - $0.05
              <span className="animate-pulse">⭐</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Standard AI Inference
            </h1>
            <p className="text-purple-200">
              Balanced quality with Qwen 1.7B model (256 tokens max)
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">
                Enter your prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What would you like the AI to generate? (e.g., 'Write a creative story about space exploration')"
                className="w-full h-40 bg-white/20 text-white rounded-lg p-4 border border-white/30 focus:border-purple-400 focus:outline-none placeholder-white/50"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? '🔄 Processing...' : '✨ Generate AI Response'}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-red-200 font-semibold">❌ Error:</p>
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 p-6 bg-green-500/20 border border-green-500 rounded-lg">
              <h3 className="text-green-300 font-bold text-lg mb-3">✅ AI Response Generated!</h3>
              <div className="bg-black/30 rounded p-4">
                {result.completion ? (
                  <p className="text-white whitespace-pre-wrap leading-relaxed">
                    {result.completion}
                  </p>
                ) : (
                  <pre className="text-white whitespace-pre-wrap text-sm">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                )}
              </div>
              {result.metadata && (
                <div className="mt-3 text-green-200 text-sm space-y-1">
                  <p>⏱️ Processing time: {result.metadata.duration_ms}ms</p>
                  <p>🔢 Tokens generated: {result.metadata.tokens || result.tokens || '~256'}</p>
                  <p>🧠 Model: Qwen 1.7B</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-purple-500/20 border border-purple-500 rounded-lg">
            <h3 className="text-purple-300 font-semibold mb-2">💡 Standard Tier Benefits</h3>
            <ul className="text-purple-200 text-sm space-y-1 list-disc list-inside">
              <li>More powerful 1.7B parameter model</li>
              <li>256 tokens max (2.5x more than Basic)</li>
              <li>Better quality for creative writing and explanations</li>
              <li>Faster processing with distributed GPU nodes</li>
              <li>On-chain payment verification via X402</li>
            </ul>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <Link
              href="/"
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-colors"
            >
              ← Back to Home
            </Link>
            <Link
              href="/content/premium"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 text-white rounded-lg font-semibold transition-opacity"
            >
              Try Premium ($0.25) →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
