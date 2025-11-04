import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
            <span className="text-purple-400 text-sm font-semibold">
              Live on Solana Devnet with X402
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white">
            The Future of{' '}
            <span className="text-purple-500">
              AI Payments
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-3xl mx-auto leading-relaxed">
            A decentralized marketplace where AI agents autonomously trade compute power
            using instant micropayments on Solana
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/marketplace"
              className="px-10 py-5 bg-purple-500 hover:bg-purple-600 text-white font-bold text-lg rounded-xl transition-all shadow-2xl"
            >
              <span className="flex items-center gap-2">
                Launch AI Marketplace
                <span className="text-2xl">→</span>
              </span>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="/content/basic"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all border border-white/5 hover:border-purple-500/30"
            >
              Try Basic ($0.01) →
            </Link>
            <Link
              href="/content/standard"
              className="px-8 py-4 bg-purple-500/10 hover:bg-purple-500/20 text-white font-semibold rounded-xl transition-all border border-purple-500/20 hover:border-purple-500/40"
            >
              Try Standard ($0.05) →
            </Link>
            <Link
              href="/content/premium"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all border border-white/5 hover:border-purple-500/30"
            >
              Try Premium ($0.25) →
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-20">
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/5">
              <div className="text-4xl font-bold text-white mb-2">
                &lt;1¢
              </div>
              <div className="text-gray-600 text-sm">Minimum Payment</div>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/5">
              <div className="text-4xl font-bold text-white mb-2">
                400ms
              </div>
              <div className="text-gray-600 text-sm">Solana Finality</div>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/5">
              <div className="text-4xl font-bold text-white mb-2">
                100%
              </div>
              <div className="text-gray-600 text-sm">Decentralized</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
            Why ParallaxPay?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '⚡',
                title: 'Instant Micropayments',
                desc: 'Pay only for what you use with X402 protocol. Sub-second transactions on Solana.',
              },
              {
                icon: '🔗',
                title: 'Distributed GPU Network',
                desc: 'Access powerful AI models through Gradient Parallax distributed computing.',
              },
              {
                icon: '🛡️',
                title: 'On-Chain Verification',
                desc: 'Trustless provider verification with transparent, immutable on-chain proofs.',
              },
              {
                icon: '🤖',
                title: 'Autonomous Agents',
                desc: 'AI agents can discover, negotiate, and transact independently 24/7.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/5 hover:border-purple-500/30 transition-all"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-4">
            Choose Your Tier
          </h2>
          <p className="text-center text-gray-500 mb-16 text-lg">
            Pay only for what you use. No subscriptions. No accounts required.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Basic',
                price: '$0.01',
                tokens: '100',
                desc: 'Fast inference for quick tasks',
                link: '/content/basic',
              },
              {
                name: 'Standard',
                price: '$0.05',
                tokens: '256',
                desc: 'Better quality for medium content',
                link: '/content/standard',
                popular: true,
              },
              {
                name: 'Premium',
                price: '$0.25',
                tokens: '512',
                desc: 'Best quality for long-form content',
                link: '/content/premium',
              },
            ].map((tier, i) => (
              <div
                key={i}
                className={`relative bg-black/20 backdrop-blur-sm rounded-2xl p-8 border ${
                  tier.popular
                    ? 'border-purple-500/30 bg-purple-500/5'
                    : 'border-white/5'
                } hover:border-purple-500/30 transition-all`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-purple-500 rounded-full text-white text-sm font-bold">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="text-5xl font-bold text-white mb-2">
                    {tier.price}
                  </div>
                  <div className="text-gray-600 text-sm">{tier.tokens} tokens max</div>
                </div>
                <p className="text-gray-500 text-center mb-6">{tier.desc}</p>
                <Link
                  href={tier.link}
                  className={`block w-full py-3 ${
                    tier.popular
                      ? 'bg-purple-500 hover:bg-purple-600'
                      : 'bg-white/5 hover:bg-white/10 border border-white/5'
                  } text-white font-semibold rounded-xl text-center transition-all`}
                >
                  Try {tier.name} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Select Tier',
                desc: 'Choose the tier that fits your needs',
              },
              {
                step: '02',
                title: 'Enter Prompt',
                desc: 'Payment happens automatically via X402',
              },
              {
                step: '03',
                title: 'Get Results',
                desc: 'Receive AI response instantly',
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-6xl font-bold text-purple-500 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto bg-purple-500/10 border border-purple-500/20 rounded-3xl p-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-500 mb-8">
            Join the decentralized AI economy. Pay only for what you use.
          </p>
          <Link
            href="/content/basic"
            className="inline-block px-10 py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl transition-all shadow-lg"
          >
            Start with Basic ($0.01) →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-6 py-12 border-t border-white/5">
        <div className="text-center text-gray-600">
          <p className="mb-2">Built for X402 Solana Hackathon - Gradient Parallax Track</p>
          <p className="text-sm">Powered by Solana, X402, and Gradient Parallax</p>
        </div>
      </div>
    </div>
  )
}
