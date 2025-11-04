import { Router } from 'express';

const router = Router();

/**
 * GET /api/discovery
 *
 * Service discovery endpoint for autonomous agents
 *
 * Returns provider capabilities, pricing, and reputation
 */
router.get('/', (req, res) => {
  const reputationTracker = req.app.locals.reputationTracker;
  const stats = reputationTracker.getStats();

  res.json({
    protocol: 'parallaxpay-v1',
    provider: {
      name: process.env.PROVIDER_NAME || 'ParallaxPay Provider',
      address: req.app.locals.providerWallet.publicKey.toBase58(),
      region: process.env.PROVIDER_REGION || 'unknown',
      network: process.env.NETWORK || 'devnet'
    },
    capabilities: {
      models: [process.env.PARALLAX_MODEL || 'Qwen/Qwen3-0.6B'],
      max_tokens: 512,
      streaming: false,
      batch_processing: false
    },
    pricing: {
      currency: 'USDC',
      tiers: {
        basic: {
          price_usd: parseFloat(process.env.BASIC_PRICE || '0.01'),
          max_tokens: 100
        },
        standard: {
          price_usd: parseFloat(process.env.STANDARD_PRICE || '0.05'),
          max_tokens: 256
        },
        premium: {
          price_usd: parseFloat(process.env.PREMIUM_PRICE || '0.25'),
          max_tokens: 512
        }
      }
    },
    reputation: {
      total_transactions: stats.totalTransactions,
      success_rate: stats.successRate,
      avg_response_time_ms: stats.averageResponseTime,
      uptime_ms: stats.uptime,
      rating: calculateRating(stats)
    },
    endpoints: {
      inference: '/v1/inference',
      payment: '/api/payment',
      info: '/api/info'
    },
    payment_methods: ['x402', 'direct'],
    facilitator: process.env.FACILITATOR_URL,
    timestamp: Date.now()
  });
});

/**
 * Calculate provider rating (0-5 stars)
 */
function calculateRating(stats: any): number {
  if (stats.totalTransactions === 0) return 5.0;

  let rating = 5.0;

  // Reduce rating based on success rate
  if (stats.successRate < 95) rating -= 0.5;
  if (stats.successRate < 90) rating -= 0.5;
  if (stats.successRate < 80) rating -= 1.0;

  // Reduce rating for slow response times
  if (stats.averageResponseTime > 5000) rating -= 0.5;
  if (stats.averageResponseTime > 10000) rating -= 0.5;

  return Math.max(0, Math.min(5, rating));
}

export { router as discoveryRouter };
