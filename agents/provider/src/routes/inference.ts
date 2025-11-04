import { Router } from 'express';
import { x402Middleware } from '../middleware/x402';
import { parallaxService } from '../services/parallax';

const router = Router();

/**
 * POST /v1/inference
 *
 * AI Inference endpoint protected by x402 payment middleware
 *
 * This endpoint:
 * 1. Checks for valid x402 payment
 * 2. Validates payment amount matches tier pricing
 * 3. Forwards request to Gradient Parallax
 * 4. Returns AI-generated response
 * 5. Updates reputation metrics
 */
router.post('/', x402Middleware, async (req, res) => {
  const startTime = Date.now();

  try {
    const { prompt, model, max_tokens, temperature = 0.7 } = req.body;

    // Validate request
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid prompt'
      });
    }

    // Determine tier based on max_tokens
    let tier = 'basic';
    if (max_tokens >= 512) tier = 'premium';
    else if (max_tokens >= 256) tier = 'standard';

    console.log(`🤖 Processing ${tier} inference request: ${prompt.slice(0, 50)}...`);

    // Call Gradient Parallax
    const result = await parallaxService.generateCompletion({
      prompt,
      model: model || process.env.PARALLAX_MODEL || 'Qwen/Qwen3-0.6B',
      max_tokens: max_tokens || 100,
      temperature
    });

    const duration = Date.now() - startTime;

    // Track successful completion
    const reputationTracker = req.app.locals.reputationTracker;
    reputationTracker.recordTransaction({
      success: true,
      duration,
      tier,
      tokens: result.tokens
    });

    // Return result
    res.json({
      success: true,
      completion: result.completion,
      tokens: result.tokens,
      tier,
      metadata: {
        provider: req.app.locals.providerWallet.publicKey.toBase58(),
        model: result.model,
        duration_ms: duration,
        network: process.env.NETWORK
      }
    });

  } catch (error: any) {
    console.error('❌ Inference error:', error);

    // Track failed completion
    const reputationTracker = req.app.locals.reputationTracker;
    reputationTracker.recordTransaction({
      success: false,
      duration: Date.now() - startTime,
      tier: 'basic',
      tokens: 0
    });

    res.status(500).json({
      error: 'Inference failed',
      message: error.message
    });
  }
});

// Options endpoint for CORS preflight
router.options('/', (req, res) => {
  res.sendStatus(200);
});

export { router as inferenceRouter };
