'use client'

interface Transaction {
  timestamp: string
  provider: string
  tier: string
  cost: number
  tokens?: number
  duration?: number
  status: 'success' | 'failed' | 'pending_payment'
  prompt: string
  response?: string
  error?: string
}

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'pending_payment':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✓'
      case 'failed':
        return '✕'
      case 'pending_payment':
        return '⏱'
      default:
        return '○'
    }
  }

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-white">
          Transaction History
        </h2>
        <span className="text-xs text-gray-600">
          {transactions.length} total
        </span>
      </div>

      <div className="space-y-3">
        {transactions.map((tx, i) => (
          <div
            key={i}
            className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-1 rounded border font-medium ${getStatusColor(tx.status)}`}>
                  {getStatusIcon(tx.status)} {tx.status.replace('_', ' ')}
                </span>
                <span className="text-[10px] px-2 py-1 bg-purple-500/10 text-purple-400 rounded capitalize">
                  {tx.tier}
                </span>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold text-sm">${tx.cost.toFixed(2)}</p>
                {tx.tokens && (
                  <p className="text-gray-600 text-[10px]">{tx.tokens} tokens</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                <span className="text-gray-600">Prompt:</span> {tx.prompt}
              </p>
              {tx.response && (
                <p className="text-xs text-gray-500">
                  <span className="text-gray-600">Response:</span> {tx.response}
                </p>
              )}
              {tx.error && (
                <p className="text-xs text-red-400">
                  <span className="text-red-500">Error:</span> {tx.error}
                </p>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-600">
              <span>{new Date(tx.timestamp).toLocaleString()}</span>
              {tx.duration && <span>⏱ {tx.duration}ms</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
