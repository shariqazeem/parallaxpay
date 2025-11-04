#!/usr/bin/env node

/**
 * ParallaxPay Setup Script
 *
 * Automates the setup process for the entire ParallaxPay stack
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');

console.log(`
╔══════════════════════════════════════════════════════════════╗
║     🚀 ParallaxPay Setup Wizard 🚀                          ║
╠══════════════════════════════════════════════════════════════╣
║  This script will:                                           ║
║    1. Generate Solana wallets                                ║
║    2. Create .env files with configuration                   ║
║    3. Display funding instructions                           ║
║    4. Provide startup commands                               ║
╚══════════════════════════════════════════════════════════════╝
`);

// Helper function to execute commands
function exec(command, options = {}) {
  try {
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`Failed to execute: ${command}`);
    throw error;
  }
}

// Generate Solana keypair
function generateKeypair() {
  const keypair = Keypair.generate();
  const privateKey = bs58.encode(keypair.secretKey);
  const publicKey = keypair.publicKey.toBase58();
  return { privateKey, publicKey };
}

// Main setup function
async function setup() {
  console.log('[1/5] 🔐 Generating Solana wallets...\n');

  // Generate provider wallet
  const providerWallet = generateKeypair();
  console.log('✅ Provider Wallet Generated:');
  console.log(`   Public Key:  ${providerWallet.publicKey}`);
  console.log(`   Private Key: ${providerWallet.privateKey.slice(0, 20)}...\n`);

  // Generate client wallet
  const clientWallet = generateKeypair();
  console.log('✅ Client Wallet Generated:');
  console.log(`   Public Key:  ${clientWallet.publicKey}`);
  console.log(`   Private Key: ${clientWallet.privateKey.slice(0, 20)}...\n`);

  console.log('[2/5] 📝 Creating configuration files...\n');

  // Create provider .env
  const providerEnv = `# ParallaxPay Provider Agent Configuration
PORT=4001
HOST=0.0.0.0

# Solana Configuration
NETWORK=devnet
PROVIDER_WALLET_PRIVATE_KEY=${providerWallet.privateKey}
USDC_MINT_ADDRESS=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# Gradient Parallax Configuration
PARALLAX_SCHEDULER_URL=http://localhost:3001
PARALLAX_MODEL=Qwen/Qwen3-0.6B

# Pricing Configuration (in USD)
BASIC_PRICE=0.01
STANDARD_PRICE=0.05
PREMIUM_PRICE=0.25

# x402 Facilitator
FACILITATOR_URL=https://facilitator.corbits.dev

# Provider Information
PROVIDER_NAME=ParallaxPay Primary Node
PROVIDER_REGION=us-west
`;

  fs.writeFileSync('agents/provider/.env', providerEnv);
  console.log('✅ Created agents/provider/.env');

  // Create client .env
  const clientEnv = `# ParallaxPay Client Agent Configuration

# Solana Configuration
NETWORK=devnet
CLIENT_WALLET_PRIVATE_KEY=${clientWallet.privateKey}
USDC_MINT_ADDRESS=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# Provider Discovery
PROVIDER_REGISTRY_URL=http://localhost:4001
DEFAULT_PROVIDER=http://localhost:4001

# Budget Limits
MAX_PRICE_PER_REQUEST=0.50
DAILY_BUDGET=5.00

# Agent Behavior
AUTO_SELECT_CHEAPEST=true
MIN_PROVIDER_RATING=3.0
PREFER_FAST_PROVIDERS=true
`;

  fs.writeFileSync('agents/client/.env', clientEnv);
  console.log('✅ Created agents/client/.env');

  // Create dashboard .env.local
  const dashboardEnv = `# ParallaxPay Dashboard Configuration

# Provider Wallet (receives payments)
NEXT_PUBLIC_RECEIVER_ADDRESS=${providerWallet.publicKey}

# Network Configuration
NEXT_PUBLIC_NETWORK=solana-devnet

# X402 Facilitator
NEXT_PUBLIC_FACILITATOR_URL=https://x402.org/facilitator

# Coinbase Developer Platform Client Key
# Get your key from: https://portal.cdp.coinbase.com/
NEXT_PUBLIC_CDP_CLIENT_KEY=

# Gradient Parallax / Inference Provider
NEXT_PUBLIC_PROVIDER_ENDPOINT=http://localhost:4001
`;

  fs.writeFileSync('parallaxpayx402/.env.local', dashboardEnv);
  console.log('✅ Created parallaxpayx402/.env.local\n');

  console.log('[3/5] 💰 Funding Instructions:\n');
  console.log('To use ParallaxPay on devnet, you need to fund your wallets:\n');

  console.log('1. Fund Provider Wallet with SOL:');
  console.log(`   solana airdrop 2 ${providerWallet.publicKey} --url devnet\n`);

  console.log('2. Fund Client Wallet with SOL:');
  console.log(`   solana airdrop 2 ${clientWallet.publicKey} --url devnet\n`);

  console.log('3. Get Devnet USDC from Circle Faucet:');
  console.log('   Visit: https://faucet.circle.com/');
  console.log(`   Address for Client: ${clientWallet.publicKey}\n`);

  console.log('[4/5] 🔑 Coinbase CDP Setup (Optional):\n');
  console.log('For the dashboard to work with Coinbase Pay, you need a CDP key:');
  console.log('1. Visit https://portal.cdp.coinbase.com/');
  console.log('2. Create a new project');
  console.log('3. Get your Client Key');
  console.log('4. Add it to parallaxpayx402/.env.local as NEXT_PUBLIC_CDP_CLIENT_KEY\n');

  console.log('[5/5] 🚀 Starting Instructions:\n');
  console.log('To start ParallaxPay, run these commands in separate terminals:\n');

  console.log('Terminal 1 - Provider Agent:');
  console.log('   cd agents/provider && npm install && npm run dev\n');

  console.log('Terminal 2 - Dashboard:');
  console.log('   cd parallaxpayx402 && npm install --legacy-peer-deps && npm run dev\n');

  console.log('Terminal 3 - Client Demo:');
  console.log('   cd agents/client && npm install && npm run demo\n');

  console.log('Terminal 4 - Gradient Parallax (Optional):');
  console.log('   cd parallax && parallax run --host 0.0.0.0\n');

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  ✅ Setup Complete! ✅                                       ║
╠══════════════════════════════════════════════════════════════╣
║  Next Steps:                                                 ║
║    1. Fund your wallets (see instructions above)            ║
║    2. Get CDP key for Coinbase Pay (optional)               ║
║    3. Start the services in separate terminals              ║
║                                                              ║
║  Visit http://localhost:3000 when ready!                    ║
╚══════════════════════════════════════════════════════════════╝
  `);

  // Save wallet info for reference
  const walletInfo = {
    provider: {
      publicKey: providerWallet.publicKey,
      privateKey: providerWallet.privateKey
    },
    client: {
      publicKey: clientWallet.publicKey,
      privateKey: clientWallet.privateKey
    },
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync('.wallets.json', JSON.stringify(walletInfo, null, 2));
  console.log('\n💾 Wallet info saved to .wallets.json (keep this secure!)\n');
}

// Run setup
setup().catch((error) => {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
});
