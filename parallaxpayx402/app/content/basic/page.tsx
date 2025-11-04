'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function BasicInferencePage() {
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
          model: 'Qwen/Qwen3-0.6B',
          prompt,
          max_tokens: 100,
          temperature: 0.7,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <div className="inline-block px-4 py-2 bg-blue-500 rounded-full text-white text-sm font-semibold mb-4">
              Basic Tier - $0.01
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Basic AI Inference
            </h1>
            <p className="text-blue-200">
              Fast inference with Qwen 0.6B model (100 tokens max)
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
                placeholder="What would you like the AI to generate? (e.g., 'Explain quantum computing in simple terms')"
                className="w-full h-32 bg-white/20 text-white rounded-lg p-4 border border-white/30 focus:border-blue-400 focus:outline-none placeholder-white/50"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                  <p className="text-white whitespace-pre-wrap">
                    {result.completion}
                  </p>
                ) : (
                  <pre className="text-white whitespace-pre-wrap text-sm">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                )}
              </div>
              {result.metadata && (
                <div className="mt-3 text-green-200 text-sm">
                  <p>⏱️ Processing time: {result.metadata.duration_ms}ms</p>
                  <p>🔢 Tokens generated: {result.metadata.tokens || result.tokens || '~100'}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-500/20 border border-blue-500 rounded-lg">
            <h3 className="text-blue-300 font-semibold mb-2">💡 How it works</h3>
            <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
              <li>You accessed this page (X402 payment of $0.01 was verified)</li>
              <li>Enter your prompt in the text area</li>
              <li>Click Generate to get AI inference from Gradient Parallax</li>
              <li>Distributed LLM nodes process your request</li>
              <li>Receive your AI-generated content instantly!</li>
            </ol>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
