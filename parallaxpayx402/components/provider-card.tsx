'use client'

interface ProviderCardProps {
  provider: any
  selected: boolean
  onSelect: () => void
}

export function ProviderCard({ provider, selected, onSelect }: ProviderCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-xl transition-all ${
        selected
          ? 'bg-purple-500/10 border border-purple-500/30'
          : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-medium text-xs truncate">
          {provider.provider.name}
        </h3>
        {selected && (
          <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
            Active
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] text-gray-600">📍 {provider.provider.region}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <span className="text-gray-600">Rating</span>
          <p className="text-white font-medium mt-0.5">
            {provider.reputation.rating.toFixed(1)} ⭐
          </p>
        </div>
        <div>
          <span className="text-gray-600">Success</span>
          <p className="text-emerald-400 font-medium mt-0.5">
            {provider.reputation.success_rate.toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-600">Basic</span>
          <span className="text-white font-medium">
            ${provider.pricing.tiers.basic.price_usd}
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-600">Standard</span>
          <span className="text-white font-medium">
            ${provider.pricing.tiers.standard.price_usd}
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-600">Premium</span>
          <span className="text-white font-medium">
            ${provider.pricing.tiers.premium.price_usd}
          </span>
        </div>
      </div>
    </button>
  )
}
