import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 border border-purple-500 rounded-full mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-purple-300 text-sm font-semibold">
              Live on Solana Devnet with X402
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white">
            The Future of{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              AI Payments
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            A decentralized marketplace where AI agents autonomously trade compute power
            using instant micropayments on Solana
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="/content/basic"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:scale-105 transition-transform shadow-lg"
            >
              Try Basic ($0.01) →
            </Link>
            <Link
              href="/content/standard"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg hover:scale-105 transition-transform shadow-lg"
            >
              Try Standard ($0.05) →
            </Link>
            <Link
              href="/content/premium"
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-lg hover:scale-105 transition-transform shadow-lg"
            >
              Try Premium ($0.25) →
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-20">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
                &lt;1¢
              </div>
              <div className="text-gray-300">Minimum Payment</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
                400ms
              </div>
              <div className="text-gray-300">Solana Finality</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-600 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <div className="text-gray-300">Decentralized</div>
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
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-purple-500 transition-all hover:scale-105"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.desc}</p>
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
          <p className="text-center text-gray-300 mb-16 text-lg">
            Pay only for what you use. No subscriptions. No accounts required.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Basic',
                price: '$0.01',
                tokens: '100',
                desc: 'Fast inference for quick tasks',
                color: 'from-blue-500 to-purple-600',
                link: '/content/basic',
              },
              {
                name: 'Standard',
                price: '$0.05',
                tokens: '256',
                desc: 'Better quality for medium content',
                color: 'from-purple-500 to-pink-600',
                link: '/content/standard',
                popular: true,
              },
              {
                name: 'Premium',
                price: '$0.25',
                tokens: '512',
                desc: 'Best quality for long-form content',
                color: 'from-amber-500 to-orange-600',
                link: '/content/premium',
              },
            ].map((tier, i) => (
              <div
                key={i}
                className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border ${
                  tier.popular
                    ? 'border-purple-500 scale-105'
                    : 'border-white/20'
                } hover:scale-105 transition-transform`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-purple-500 rounded-full text-white text-sm font-bold">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className={`text-5xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent mb-2`}>
                    {tier.price}
                  </div>
                  <div className="text-gray-300 text-sm">{tier.tokens} tokens max</div>
                </div>
                <p className="text-gray-300 text-center mb-6">{tier.desc}</p>
                <Link
                  href={tier.link}
                  className={`block w-full py-3 bg-gradient-to-r ${tier.color} text-white font-bold rounded-lg text-center hover:opacity-90 transition-opacity`}
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
                <div className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500 rounded-3xl p-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the decentralized AI economy. Pay only for what you use.
          </p>
          <Link
            href="/content/basic"
            className="inline-block px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg hover:scale-105 transition-transform shadow-lg"
          >
            Start with Basic ($0.01) →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-6 py-12 border-t border-white/10">
        <div className="text-center text-gray-400">
          <p className="mb-2">Built for X402 Solana Hackathon - Gradient Parallax Track</p>
          <p className="text-sm">Powered by Solana, X402, and Gradient Parallax</p>
        </div>
      </div>
    </div>
  )
}
