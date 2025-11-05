// parallaxpayx402/app/content/basic/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Connection } from '@solana/web3.js'
import { createPhantomWallet, isPhantomInstalled, getWalletBalance, type X402Wallet } from '@/lib/x402/wallet'
import { createX402Fetch } from '@/lib/x402/fetch'

export default function BasicInferencePage() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showReasoning, setShowReasoning] = useState(false)

  // Wallet state
  const [wallet, setWallet] = useState<X402Wallet | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null)
  const [txSignature, setTxSignature] = useState<string | null>(null)

  // Initialize connection
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed')

  // Check wallet balance when wallet connects
  useEffect(() => {
    if (wallet) {
      getWalletBalance(connection, wallet.publicKey).then(setBalance)
    }
  }, [wallet])

  const handleConnectWallet = async () => {
    try {
      if (!isPhantomInstalled()) {
        toast.error('Phantom wallet not found. Please install it.')
        window.open('https://phantom.app/', '_blank')
        return
      }

      const newWallet = await createPhantomWallet()
      setWallet(newWallet)
      toast.success(`Connected: ${newWallet.publicKey.toString().slice(0, 8)}...`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect wallet'
      toast.error(errorMsg)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    if (!wallet) {
      toast.error('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setPaymentAmount(null)
    setTxSignature(null)

    try {
      const providerEndpoint = process.env.NEXT_PUBLIC_PROVIDER_ENDPOINT || 'http://localhost:4001'

      // Create fetch wrapper with automatic payment handling
      const fetchWithPayment = createX402Fetch({
        wallet,
        connection,
        onPaymentRequired: (amount) => {
          setPaymentAmount(amount)
          toast.info(`Payment required: ${amount} SOL`)
        },
        onPaymentCreated: (sig) => {
          setTxSignature(sig)
          toast.success('Payment sent!')
        }
      })

      // Use the wrapped fetch - it will automatically handle 402 responses
      const response = await fetchWithPayment(`${providerEndpoint}/v1/inference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'Qwen/Qwen3-0.6B',
          prompt: prompt,
          max_tokens: 100,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Request failed (${response.status}): ${errorText || response.statusText}`)
      }

      const data = await response.json()
      setResult(data)
      toast.success('AI response generated!')

      // Refresh balance after payment
      if (paymentAmount) {
        const newBalance = await getWalletBalance(connection, wallet.publicKey)
        setBalance(newBalance)
      }
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
                <h1 className="text-4xl font-bold text-white mb-2">
                  Basic AI Inference
                </h1>
                <p className="text-blue-200">
                  Fast inference with Qwen 0.6B model (100 tokens max)
                </p>
              </div>
              {!wallet ? (
                <button
                  onClick={handleConnectWallet}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-lg transition-all"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="text-right">
                  <div className="px-4 py-2 bg-green-500/20 border border-green-500 rounded-lg">
                    <p className="text-green-300 text-sm font-semibold">
                      ✅ Wallet Connected
                    </p>
                    <p className="text-white text-xs mt-1 font-mono">
                      {wallet.publicKey.toString().slice(0, 8)}...
                    </p>
                    {balance !== null && (
                      <p className="text-green-200 text-xs mt-1">
                        Balance: {balance.toFixed(4)} SOL
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            {wallet && (
              <div className="p-3 bg-blue-500/20 border border-blue-500 rounded-lg">
                <p className="text-blue-200 text-sm">
                  💡 Ready for automatic payments! When you click generate, the provider will request payment if needed, and your wallet will handle it automatically.
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
              disabled={!prompt.trim() || loading || !wallet}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? '🔄 Processing...' : !wallet ? '🔒 Connect Wallet to Generate' : '✨ Generate AI Response'}
            </button>
          </div>

          {/* Payment Status */}
          {paymentAmount && (
            <div className="mt-6 p-4 bg-purple-500/20 border border-purple-500 rounded-lg">
              <p className="text-purple-200 font-semibold">💳 Payment Processed:</p>
              <p className="text-purple-100">Amount: {paymentAmount} SOL</p>
              {txSignature && (
                <div className="mt-2">
                  <p className="text-purple-100 text-sm">Transaction:</p>
                  <a
                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-200 text-xs font-mono break-all underline"
                  >
                    {txSignature}
                  </a>
                </div>
              )}
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
                    <span>🎯 Tier: {result.tier}</span>
                    <span>🔢 Tokens: {result.tokens}</span>
                    <span>⏱️ Time: {result.metadata.duration_ms}ms</span>
                    <span>🤖 Model: {result.metadata.model.split('/')[1]}</span>
                  </div>
                </div>
              )}
            </div>
          )}

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