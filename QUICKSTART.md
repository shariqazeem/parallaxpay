# 🚀 ParallaxPay Quick Start

Get ParallaxPay running in **5 minutes**!

---

## Prerequisites

- Node.js >= 18
- npm or pnpm
- Solana CLI (for wallet funding)

---

## Option 1: Automatic Setup (Recommended)

```bash
# 1. Clone and enter directory
git clone https://github.com/your-org/parallaxpay
cd parallaxpay

# 2. Run setup wizard (installs dependencies automatically)
npm run setup
# This will:
#   - Generate Solana wallets
#   - Create .env files
#   - Provide funding instructions

# 4. Fund your wallets (copy commands from setup output)
solana airdrop 2 <PROVIDER_ADDRESS> --url devnet
solana airdrop 2 <CLIENT_ADDRESS> --url devnet

# 5. Start all services
```

### Terminal 1: Provider Agent
```bash
cd agents/provider
npm install
npm run dev
```

### Terminal 2: Dashboard
```bash
cd parallaxpayx402
npm install --legacy-peer-deps
npm run dev
```

### Terminal 3: Client Demo
```bash
cd agents/client
npm install
npm run demo
```

### Open Dashboard
Visit **http://localhost:3000**

---

## Option 2: Manual Setup

### 1. Generate Wallets

```bash
# Provider wallet
solana-keygen new --outfile provider-wallet.json

# Client wallet
solana-keygen new --outfile client-wallet.json

# Get private keys (base58)
solana-keygen pubkey provider-wallet.json  # Save this
cat provider-wallet.json | jq -r 'map(tostring) | join("")' | base58  # For private key
```

### 2. Configure Provider Agent

```bash
cd agents/provider
cp .env.example .env
```

Edit `.env`:
```env
PROVIDER_WALLET_PRIVATE_KEY=<your_provider_private_key_base58>
PORT=4001
NETWORK=devnet
```

### 3. Configure Client Agent

```bash
cd agents/client
cp .env.example .env
```

Edit `.env`:
```env
CLIENT_WALLET_PRIVATE_KEY=<your_client_private_key_base58>
NETWORK=devnet
DEFAULT_PROVIDER=http://localhost:4001
```

### 4. Configure Dashboard

```bash
cd parallaxpayx402
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_RECEIVER_ADDRESS=<your_provider_public_key>
NEXT_PUBLIC_NETWORK=solana-devnet
NEXT_PUBLIC_PROVIDER_ENDPOINT=http://localhost:4001
```

### 5. Fund Wallets

```bash
# Fund provider
solana airdrop 2 <PROVIDER_PUBLIC_KEY> --url devnet

# Fund client
solana airdrop 2 <CLIENT_PUBLIC_KEY> --url devnet

# Get USDC for client from Circle faucet
# Visit: https://faucet.circle.com/
# Select Solana Devnet and enter CLIENT_PUBLIC_KEY
```

### 6. Start Services

Same as Option 1 (see above)

---

## Testing the Setup

### Test 1: Provider Health Check
```bash
curl http://localhost:4001/health
```

Expected: JSON response with provider info and reputation stats

### Test 2: Provider Info
```bash
curl http://localhost:4001/api/info
```

Expected: Provider capabilities, pricing, and endpoints

### Test 3: x402 Protection
```bash
curl -X POST http://localhost:4001/v1/inference \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello", "max_tokens": 100}'
```

Expected: 402 Payment Required response with payment details

### Test 4: Client Agent Demo
```bash
cd agents/client
npm run demo
```

Expected: Agent discovers provider, makes payment, gets AI response

### Test 5: Dashboard
1. Open http://localhost:3000
2. Click "Try Basic ($0.01)"
3. Enter a prompt
4. Click "Generate AI Response"
5. See Coinbase Pay modal (if CDP key configured)
6. Without CDP key, you'll need to manually pay

---

## Troubleshooting

### Provider won't start
- Check wallet private key is valid base58
- Ensure port 4001 is not in use
- Verify Node.js version >= 18

### Client can't discover provider
- Ensure provider is running on port 4001
- Check DEFAULT_PROVIDER in client .env
- Verify provider health endpoint responds

### Dashboard shows payment errors
- Ensure NEXT_PUBLIC_RECEIVER_ADDRESS is set
- Check provider endpoint is accessible
- For Coinbase Pay, need CDP client key

### No SOL in wallet
- Run airdrop command again (may fail first time)
- Try: `solana airdrop 1` instead of `solana airdrop 2`
- Check balance: `solana balance <ADDRESS> --url devnet`

### Transaction fails
- Ensure client wallet has SOL
- Check network connectivity
- Verify you're on devnet

---

## Next Steps

1. ✅ **Run the demo** - See autonomous agents in action
2. 📖 **Read the docs** - Check README.md and ARCHITECTURE.md
3. 🧪 **Experiment** - Try different prompts and tiers
4. 🚀 **Deploy** - Follow DEPLOYMENT.md for mainnet
5. 🔧 **Customize** - Add your own models or features

---

## Support

- **GitHub Issues**: https://github.com/your-org/parallaxpay/issues
- **Documentation**: See README.md and docs/
- **Discord**: Join our community (link in README)

---

## Quick Commands Reference

```bash
# Check provider health
curl http://localhost:4001/health

# Get provider info
curl http://localhost:4001/api/info

# Run client demo
cd agents/client && npm run demo

# Start provider
cd agents/provider && npm run dev

# Start dashboard
cd parallaxpayx402 && npm run dev

# Check wallet balance
solana balance <ADDRESS> --url devnet

# Airdrop SOL
solana airdrop 1 <ADDRESS> --url devnet
```

---

**Built with 🔥 on Solana**
