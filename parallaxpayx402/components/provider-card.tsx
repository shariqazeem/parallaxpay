'use client'

interface ProviderCardProps {
  provider: any
  selected: boolean
  onSelect: () => void
}

export function ProviderCard({ provider, selected, onSelect }: ProviderCardProps) {
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-400'
    if (rating >= 3.5) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-400'
    if (rate >= 85) return 'text-yellow-400'
    return 'text-orange-400'
  }

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        selected
          ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20'
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-white font-bold text-sm">
            {provider.provider.name}
          </h3>
          <p className="text-gray-400 text-xs mt-1">
            📍 {provider.provider.region}
          </p>
        </div>
        {selected && (
          <span className="text-xs px-2 py-1 bg-purple-500 text-white rounded">
            Selected
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <div>
          <p className="text-gray-500 text-xs">Rating</p>
          <p className={`text-sm font-bold ${getRatingColor(provider.reputation.rating)}`}>
            {provider.reputation.rating.toFixed(1)}⭐
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Success</p>
          <p className={`text-sm font-bold ${getSuccessRateColor(provider.reputation.success_rate)}`}>
            {provider.reputation.success_rate.toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Basic</span>
          <span className="text-white font-bold">
            ${provider.pricing.tiers.basic.price_usd}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-gray-400">Standard</span>
          <span className="text-white font-bold">
            ${provider.pricing.tiers.standard.price_usd}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-gray-400">Premium</span>
          <span className="text-white font-bold">
            ${provider.pricing.tiers.premium.price_usd}
          </span>
        </div>
      </div>
    </button>
  )
}
