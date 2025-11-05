import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { paymentRouter } from './routes/payment';
import { inferenceRouter } from './routes/inference';
import { discoveryRouter } from './routes/discovery';
import { reputationTracker } from './services/reputation';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4001', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Initialize Solana connection
const network = process.env.NETWORK || 'devnet';
const connection = new Connection(
  network === 'mainnet-beta'
    ? 'https://api.mainnet-beta.solana.com'
    : 'https://api.devnet.solana.com',
  'confirmed'
);

// Load provider wallet
let providerWallet: Keypair;
try {
  const privateKeyString = process.env.PROVIDER_WALLET_PRIVATE_KEY;
  if (!privateKeyString) {
    throw new Error('PROVIDER_WALLET_PRIVATE_KEY not set');
  }
  const privateKey = bs58.decode(privateKeyString);
  providerWallet = Keypair.fromSecretKey(privateKey);
  console.log(`✅ Provider wallet loaded: ${providerWallet.publicKey.toBase58()}`);
} catch (error) {
  console.error('❌ Failed to load provider wallet:', error);
  process.exit(1);
}

// Store globals for routes
app.locals.connection = connection;
app.locals.providerWallet = providerWallet;
app.locals.reputationTracker = reputationTracker;

// Routes
app.use('/api/payment', paymentRouter);
app.use('/v1/inference', inferenceRouter);
app.use('/api/discovery', discoveryRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    provider: providerWallet.publicKey.toBase58(),
    network,
    parallaxUrl: process.env.PARALLAX_SCHEDULER_URL,
    reputation: reputationTracker.getStats()
  });
});

// Provider info endpoint (for discovery)
app.get('/api/info', (req, res) => {
  res.json({
    name: process.env.PROVIDER_NAME || 'ParallaxPay Provider',
    address: providerWallet.publicKey.toBase58(),
    network,
    region: process.env.PROVIDER_REGION || 'unknown',
    models: [process.env.PARALLAX_MODEL || 'Qwen/Qwen3-0.6B'],
    pricing: {
      basic: parseFloat(process.env.BASIC_PRICE || '0.01'),
      standard: parseFloat(process.env.STANDARD_PRICE || '0.05'),
      premium: parseFloat(process.env.PREMIUM_PRICE || '0.25')
    },
    reputation: reputationTracker.getStats(),
    endpoints: {
      inference: '/v1/inference',
      payment: '/api/payment',
      discovery: '/api/discovery'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║       🚀 ParallaxPay Provider Agent Started 🚀           ║
╠═══════════════════════════════════════════════════════════╣
║  Server:     http://${HOST}:${PORT}
║  Network:    ${network}
║  Wallet:     ${providerWallet.publicKey.toBase58().slice(0, 20)}...
║  Parallax:   ${process.env.PARALLAX_SCHEDULER_URL}
║  Model:      ${process.env.PARALLAX_MODEL}
╠═══════════════════════════════════════════════════════════╣
║  Endpoints:                                               ║
║    GET  /health           - Health check                  ║
║    GET  /api/info         - Provider information          ║
║    POST /v1/inference     - AI inference (x402 protected) ║
║    GET  /api/discovery    - Service discovery             ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export { app, connection, providerWallet };
