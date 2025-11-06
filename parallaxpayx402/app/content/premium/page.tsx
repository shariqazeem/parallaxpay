'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useCorbitsPay, WalletButton } from '@/lib/corbits'
import { useWallet } from '@solana/wallet-adapter-react'

export default function PremiumInferencePage() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [showReasoning, setShowReasoning] = useState(false)

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
      console.log('🚀 Starting Premium tier inference request...')

      const response = await fetchWithPayment('/api/inference/premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',
          max_tokens: 512,
          temperature: 0.9,
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
      toast.success('Premium AI response generated!')

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border-2 border-amber-500/50">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="inline-block px-4 py-2 bg-amber-500 rounded-full text-white text-sm font-semibold mb-3">
                  👑 Premium Tier - $0.25 USDC
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Premium AI Inference
                </h1>
                <p className="text-amber-200">
                  Maximum quality with DeepSeek R1 Distill model (512 tokens max)
                </p>
              </div>
              <WalletButton />
            </div>
            {publicKey && (
              <div className="p-3 bg-amber-500/20 border border-amber-500 rounded-lg">
                <p className="text-amber-200 text-sm">
                  💡 <strong>Automatic Premium Payments:</strong> Click generate for the best AI quality.
                  Your wallet will handle the USDC payment automatically!
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">
                Enter your prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What would you like the AI to generate?"
                className="w-full h-40 bg-white/20 text-white rounded-lg p-4 border border-white/30 focus:border-amber-400 focus:outline-none placeholder-white/50"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt || loading || isProcessing || !publicKey}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              {loading || isProcessing
                ? '🔄 Processing Premium Request...'
                : !publicKey
                ? '🔒 Connect Wallet to Generate'
                : '✨ Generate Premium AI Response'}
            </button>
          </div>

          {/* Payment Status */}
          {paymentInfo && (
            <div className="mt-6 p-4 bg-amber-500/20 border border-amber-500 rounded-lg">
              <p className="text-amber-200 font-semibold">✅ Premium Payment Verified!</p>
              <p className="text-amber-100">Amount: ${(parseInt(paymentInfo.amount) / 1000000).toFixed(2)} USDC</p>
              <p className="text-amber-100 text-xs mt-1">Tier: Premium ($0.25)</p>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-red-200 font-semibold">❌ Error:</p>
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 p-6 bg-green-500/20 border border-green-500 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-green-300 font-bold text-lg">✅ Premium AI Response Generated!</h3>
                <button
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="text-xs px-3 py-1 bg-blue-500/30 hover:bg-blue-500/50 text-blue-200 rounded transition-colors"
                >
                  {showReasoning ? '🧠 Hide Reasoning' : '🧠 Show Reasoning'}
                </button>
              </div>
              <div className="bg-black/30 rounded p-4">
                <p className="text-white whitespace-pre-wrap leading-relaxed">
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
                <div className="mt-3 text-green-200 text-sm space-y-1">
                  <p>⏱️ Processing time: {result.metadata.duration_ms}ms</p>
                  <p>🔢 Tokens generated: {result.metadata.tokens || result.tokens || '~512'}</p>
                  <p>🧠 Model: DeepSeek R1 Distill (Reasoning model)</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-amber-500/20 border border-amber-500 rounded-lg">
            <h3 className="text-amber-300 font-semibold mb-2">👑 Premium Tier Benefits</h3>
            <ul className="text-amber-200 text-sm space-y-2 list-disc list-inside">
              <li>DeepSeek R1 reasoning capabilities with &lt;think&gt; tags</li>
              <li>512 tokens max (5x more than Basic)</li>
              <li>Advanced logical reasoning for complex problems</li>
              <li>Perfect for long-form content and analysis</li>
              <li>Distributed GPU processing via Gradient Parallax</li>
              <li>On-chain payment verification via x402 + Corbits</li>
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
              href="/content/basic"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white rounded-lg font-semibold transition-opacity"
            >
              Try Basic ($0.01) →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
