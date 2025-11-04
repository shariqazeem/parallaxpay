import { Router } from 'express';

const router = Router();

/**
 * GET /api/payment/pricing
 *
 * Returns current pricing information
 */
router.get('/pricing', (req, res) => {
  res.json({
    network: process.env.NETWORK || 'devnet',
    usdc_mint: process.env.USDC_MINT_ADDRESS,
    recipient: req.app.locals.providerWallet.publicKey.toBase58(),
    tiers: {
      basic: {
        price: parseFloat(process.env.BASIC_PRICE || '0.01'),
        max_tokens: 100,
        description: 'Basic AI inference'
      },
      standard: {
        price: parseFloat(process.env.STANDARD_PRICE || '0.05'),
        max_tokens: 256,
        description: 'Standard AI inference'
      },
      premium: {
        price: parseFloat(process.env.PREMIUM_PRICE || '0.25'),
        max_tokens: 512,
        description: 'Premium AI inference'
      }
    },
    facilitator: process.env.FACILITATOR_URL
  });
});

/**
 * POST /api/payment/verify
 *
 * Verify a payment transaction
 */
router.post('/verify', async (req, res) => {
  try {
    const { transaction, signature } = req.body;

    if (!transaction && !signature) {
      return res.status(400).json({
        error: 'Missing transaction or signature'
      });
    }

    const connection = req.app.locals.connection;
    const sig = transaction || signature;

    // Check transaction status
    const status = await connection.getSignatureStatus(sig, {
      searchTransactionHistory: true
    });

    if (!status || !status.value) {
      return res.json({
        valid: false,
        reason: 'Transaction not found'
      });
    }

    if (status.value.err) {
      return res.json({
        valid: false,
        reason: 'Transaction failed',
        error: status.value.err
      });
    }

    const isConfirmed = status.value.confirmationStatus === 'confirmed' ||
                        status.value.confirmationStatus === 'finalized';

    res.json({
      valid: isConfirmed,
      confirmationStatus: status.value.confirmationStatus,
      slot: status.value.slot
    });

  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: error.message
    });
  }
});

export { router as paymentRouter };
