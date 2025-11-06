'use client'

import { useState, useCallback, useEffect } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { VersionedTransaction, PublicKey } from '@solana/web3.js'
import { createPaymentFetch, type CorbitsWallet } from '@/lib/corbits'

export interface UseCorbitPayOptions {
  token?: string
  network?: 'mainnet-beta' | 'devnet' | 'testnet'
  onPaymentStart?: () => void
  onPaymentSuccess?: (signature: string) => void
  onPaymentError?: (error: Error) => void
}

export function useCorbitsPay(options: UseCorbitPayOptions = {}) {
  const {
    token = 'USDC',
    network = 'devnet',
    onPaymentStart,
    onPaymentSuccess,
    onPaymentError,
  } = options

  const { connection } = useConnection()
  const { publicKey, signTransaction } = useWallet()
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastPaymentSignature, setLastPaymentSignature] = useState<string | null>(null)

  const fetchWithPayment = useCallback(
    async (url: string, init?: RequestInit) => {
      if (!publicKey || !signTransaction) {
        throw new Error('Wallet not connected')
      }

      onPaymentStart?.()
      setIsProcessing(true)

      try {
        // Create Corbits wallet interface
        const corbitsWallet: CorbitsWallet = {
          network,
          publicKey,
          updateTransaction: async (tx: VersionedTransaction) => {
            console.log('✍️ Signing transaction...')
            const signedTx = await signTransaction(tx)
            console.log('✅ Transaction signed!')
            return signedTx as VersionedTransaction
          },
        }

        // Create payment-enabled fetch
        const paymentFetch = createPaymentFetch({
          wallet: corbitsWallet,
          connection,
          network,
          token,
        })

        // Make the request - Corbits handles 402 automatically
        const response = await paymentFetch(url, init)

        // Extract transaction signature if available
        const xPaymentHeader = response.headers.get('x-payment-signature')
        if (xPaymentHeader) {
          setLastPaymentSignature(xPaymentHeader)
          onPaymentSuccess?.(xPaymentHeader)
        }

        return response
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Payment failed')
        onPaymentError?.(err)
        throw err
      } finally {
        setIsProcessing(false)
      }
    },
    [publicKey, signTransaction, connection, network, token, onPaymentStart, onPaymentSuccess, onPaymentError]
  )

  return {
    fetchWithPayment,
    isProcessing,
    lastPaymentSignature,
    isWalletConnected: !!publicKey,
  }
}
