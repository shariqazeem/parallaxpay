'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useCorbitsPay, WalletButton } from '@/lib/corbits'
import { useWallet } from '@solana/wallet-adapter-react'

export default function BasicInferencePage() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showReasoning, setShowReasoning] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)

  const { publicKey } = useWallet()

  const { fetchWithPayment, isProcessing } = useCorbitsPay({
    token: 'USDC',
    network: 'devnet',
    onPaymentStart: () => {
      toast.info('Processing payment...')
    },
    onPaymentSuccess: (sig) => {
      toast.success('Payment successful!')
      console.log('Payment signature:', sig)
    },
    onPaymentError: (err) => {
      toast.error(err.message)
    },
  })

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    if (!publicKey) {
      toast.error('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setPaymentInfo(null)

    try {
      console.log('🚀 Starting Basic tier inference request...')

      // Use Corbits payment-enabled fetch
      const response = await fetchWithPayment('/api/inference/basic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: 'Qwen/Qwen3-0.6B',
          max_tokens: 100,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Request failed (${response.status}): ${errorText || response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Response received:', data)

      setResult(data.result)
      setPaymentInfo(data.payment)
      toast.success('AI response generated!')

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-full text-white text-sm font-semibold mb-3">
                  Basic Tier - $0.01 USDC
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Basic AI Inference
                </h1>
                <p className="text-blue-200">
                  Fast inference with Qwen 0.6B model (100 tokens max)
                </p>
              </div>
              <WalletButton />
            </div>
            {publicKey && (
              <div className="p-3 bg-blue-500/20 border border-blue-500 rounded-lg">
                <p className="text-blue-200 text-sm">
                  💡 <strong>Automatic Payments:</strong> Click generate to create your AI response.
                  If payment is required, Phantom will prompt you to approve the USDC transaction automatically!
                </p>
              </div>
            )}
          </div>

          {/* Inference UI */}
          <div className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">
                Enter your prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What would you like the AI to generate?"
                className="w-full h-32 bg-white/20 text-white rounded-lg p-4 border border-white/30 focus:border-blue-400 focus:outline-none placeholder-white/50"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading || isProcessing || !publicKey}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading || isProcessing
                ? '🔄 Processing...'
                : !publicKey
                ? '🔒 Connect Wallet to Generate'
                : '✨ Generate AI Response'}
            </button>
          </div>

          {/* Payment Status */}
          {paymentInfo && (
            <div className="mt-6 p-4 bg-purple-500/20 border border-purple-500 rounded-lg">
              <p className="text-purple-200 font-semibold">✅ Payment Verified!</p>
              <p className="text-purple-100">Amount: ${(parseInt(paymentInfo.amount) / 1000000).toFixed(2)} USDC</p>
              <p className="text-purple-100 text-xs mt-1">Tier: Basic ($0.01)</p>
            </div>
          )}

          {/* Results section */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-red-200 font-semibold">❌ Error:</p>
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 p-6 bg-green-500/20 border border-green-500 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-green-300 font-bold text-lg">✅ AI Response Generated!</h3>
                <button
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="text-xs px-3 py-1 bg-blue-500/30 hover:bg-blue-500/50 text-blue-200 rounded transition-colors"
                >
                  {showReasoning ? '🧠 Hide Reasoning' : '🧠 Show Reasoning'}
                </button>
              </div>
              <div className="bg-black/30 rounded p-4">
                <p className="text-white whitespace-pre-wrap">
                  {(() => {
                    const fullText = result.completion || result.choices?.[0]?.message?.content || '';

                    if (showReasoning) {
                      return fullText;
                    }

                    // Strip <think> tags for cleaner output
                    const cleanText = fullText
                      .replace(/<think>[\s\S]*?<\/think>/g, '')
                      .replace(/<think>[\s\S]*$/g, '')
                      .trim();

                    return cleanText || fullText;
                  })()}
                </p>
              </div>
              {result.metadata && (
                <div className="mt-3 pt-3 border-t border-green-500/30 text-xs text-green-200">
                  <div className="flex gap-4">
                    <span>🎯 Tier: {result.tier || 'basic'}</span>
                    <span>🔢 Tokens: {result.tokens || result.metadata.tokens || '~100'}</span>
                    <span>⏱️ Time: {result.metadata.duration_ms}ms</span>
                    <span>🤖 Model: {result.metadata.model.split('/')[1]}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-500/20 border border-blue-500 rounded-lg">
            <h3 className="text-blue-300 font-semibold mb-2">💡 Basic Tier Features</h3>
            <ul className="text-blue-200 text-sm space-y-1 list-disc list-inside">
              <li>Qwen 0.6B parameter model</li>
              <li>100 tokens max per request</li>
              <li>$0.01 USDC per inference</li>
              <li>Automatic x402 payment via Corbits</li>
              <li>Perfect for quick queries and testing</li>
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
              href="/content/standard"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 text-white rounded-lg font-semibold transition-opacity"
            >
              Try Standard ($0.05) →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
