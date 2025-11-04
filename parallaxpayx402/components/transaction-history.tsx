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
  if (transactions.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
        <p className="text-gray-400">No transactions yet</p>
        <p className="text-gray-500 text-sm mt-1">
          Generate your first AI response to see transaction history
        </p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-300 border-green-500/50'
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/50'
      case 'pending_payment':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅'
      case 'failed':
        return '❌'
      case 'pending_payment':
        return '⏳'
      default:
        return '⚪'
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">
          📊 Transaction History
        </h2>
        <span className="text-sm text-gray-400">
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {transactions.map((tx, i) => (
          <div
            key={i}
            className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(tx.status)}`}>
                    {getStatusIcon(tx.status)} {tx.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                    {tx.tier}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(tx.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">${tx.cost.toFixed(2)}</p>
                {tx.tokens && (
                  <p className="text-gray-400 text-xs">{tx.tokens} tokens</p>
                )}
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-sm text-gray-300">
                <span className="text-gray-500">Prompt:</span> {tx.prompt}
              </p>
              {tx.response && (
                <p className="text-sm text-gray-300 mt-1">
                  <span className="text-gray-500">Response:</span> {tx.response}
                </p>
              )}
              {tx.error && (
                <p className="text-sm text-red-300 mt-1">
                  <span className="text-red-400">Error:</span> {tx.error}
                </p>
              )}
            </div>

            {tx.duration && (
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                <span>⏱️ {tx.duration}ms</span>
                <span>🏢 {tx.provider}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
