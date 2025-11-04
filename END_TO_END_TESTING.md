# 🚀 ParallaxPay - Complete End-to-End Testing Guide

## Status: Parallax Integration ✅

**YES, Parallax is already implemented!** Here's how it works:

### What's Already Built

1. **Provider Agent** (`agents/provider/src/services/parallax.ts`)
   - Calls Parallax scheduler at `http://localhost:3001`
   - OpenAI-compatible API format
   - Falls back to mock if Parallax unavailable
   - Full error handling

2. **Frontend Integration** (Next.js dashboard)
   - Configured to work with either provider agent OR Parallax directly
   - All content pages ready for Parallax
   - X402 payment middleware integrated

---

## 🎯 Three Ways to Run End-to-End

### Option 1: Quick Demo (No Parallax Install) ⚡

**Best for**: Quick testing, showing the autonomous agents

```bash
# Terminal 1: Start Provider Agent
cd agents/provider
npm install
npm start

# Terminal 2: Start Client Agent Demo
cd agents/client
npm install
npm run demo

# Terminal 3: Start Dashboard (optional)
cd parallaxpayx402
npm install
npm run dev
```

**What happens**:
- Client discovers provider at localhost:4001
- Makes automatic Solana payments
- Gets AI responses (mock mode)
- Budget tracking works
- Reputation system tracks performance

**Demo script**:
> "This is our autonomous agent marketplace. The client agent automatically discovers providers, negotiates pricing, and makes micropayments on Solana. Watch as it makes real blockchain transactions for AI compute."

---

### Option 2: With Real Parallax (Single Machine) 🌊

**Best for**: Showing distributed AI inference

#### Step 1: Install Parallax

**macOS (Apple Silicon)**:
```bash
git clone https://github.com/GradientHQ/parallax.git
cd parallax
python3 -m venv ./venv
source ./venv/bin/activate
pip install -e '.[mac]'
```

**Linux/WSL (NVIDIA GPU)**:
```bash
git clone https://github.com/GradientHQ/parallax.git
cd parallax
python3 -m venv ./venv
source ./venv/bin/activate
pip install -e '.[gpu]'
```

**Windows**:
```bash
# Download from GitHub releases
# Install as administrator
parallax install
```

#### Step 2: Start Parallax Scheduler

```bash
# With Web UI (recommended)
parallax run --host 0.0.0.0

# This starts:
# - Scheduler API on port 3001
# - Web UI on port 3002
```

**Or without UI** (faster):
```bash
parallax run -m Qwen/Qwen3-0.6B -n 2 --host 0.0.0.0
```

#### Step 3: Verify Parallax is Running

```bash
# Check health
curl http://localhost:3001/health

# Test inference
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Hello Parallax!"}],
    "stream": false
  }'
```

You should see a JSON response with AI completion!

#### Step 4: Start ParallaxPay Components

```bash
# Terminal 1: Parallax (already running from Step 2)

# Terminal 2: Provider Agent (connects to Parallax)
cd agents/provider
npm start
# You'll see: "🌊 Calling Parallax at http://localhost:3001"

# Terminal 3: Client Demo
cd agents/client
npm run demo
# Watch autonomous agents trade compute!

# Terminal 4: Dashboard (optional)
cd parallaxpayx402
npm run dev
# Visit http://localhost:3000
```

**Demo script**:
> "ParallaxPay uses Gradient Parallax for distributed AI inference. The scheduler at port 3001 coordinates across multiple GPU nodes. Our provider agent calls Parallax, which distributes the workload. Combined with x402 micropayments on Solana, this creates a fully decentralized AI marketplace."

---

### Option 3: Multi-Node Parallax Cluster 🔥

**Best for**: Maximum hackathon points, showing true distribution

#### On Main Machine (Scheduler)

```bash
# Terminal 1: Start Parallax Scheduler
parallax run --host 0.0.0.0

# Copy the multiaddress from logs, looks like:
# 12D3KooWLX7MWuzi1Txa5LyZS4eTQ2tPaJijheH8faHggB9SxnBu
```

#### On Additional Machines (Workers)

**Same network**:
```bash
parallax join
```

**Different network** (use scheduler address from logs):
```bash
parallax join -s 12D3KooWLX7MWuzi1Txa5LyZS4eTQ2tPaJijheH8faHggB9SxnBu
```

#### Back on Main Machine

```bash
# Terminal 2: Provider Agent
cd agents/provider
npm start

# Terminal 3: Client Demo
cd agents/client
npm run demo

# Terminal 4: Dashboard
cd parallaxpayx402
npm run dev
```

**Demo script**:
> "This is a true decentralized AI compute network. We have [X] GPU nodes connected across [locations]. The Parallax scheduler distributes inference work using pipeline parallelism. Each request is paid for via Solana micropayments using the x402 protocol. This is the future of AI infrastructure."

---

## 🔍 Testing Each Component

### 1. Test Parallax Alone

```bash
# Health check
curl http://localhost:3001/health

# Chat completion
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "max_tokens": 256,
    "messages": [
      {"role": "user", "content": "Explain Solana in one sentence"}
    ],
    "stream": false
  }'

# You should see:
# {"choices": [{"message": {"content": "..."}}], "usage": {...}}
```

### 2. Test Provider Agent

```bash
# Start provider
cd agents/provider
npm start

# In another terminal, test it
curl -X POST http://localhost:4001/v1/inference \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen3-0.6B",
    "prompt": "Hello!",
    "max_tokens": 100,
    "temperature": 0.7
  }'

# You should see:
# {"completion": "...", "tokens": 100, "model": "Qwen/Qwen3-0.6B"}
```

### 3. Test Autonomous Client

```bash
cd agents/client
npm run demo

# Watch the output:
# 🔍 Discovering providers...
# 💰 Budget: 1.00 SOL
# 🤖 Requesting inference from http://localhost:4001
# 💳 Creating payment...
# ✅ Success! Got 87 tokens
# 📊 Budget remaining: 0.999 SOL
```

### 4. Test Dashboard

```bash
cd parallaxpayx402
npm run dev

# Visit http://localhost:3000
# Navigate to http://localhost:3000/marketplace
# Try the AI inference panel
```

---

## 🎬 Complete Demo Flow

### Scenario: Show Everything Working

**Setup** (5 minutes):
```bash
# Terminal 1: Parallax
parallax run --host 0.0.0.0

# Terminal 2: Provider
cd agents/provider && npm start

# Terminal 3: Keep free for demo

# Terminal 4: Dashboard
cd parallaxpayx402 && npm run dev
```

**Demo** (10 minutes):

1. **Show Parallax UI** (http://localhost:3002)
   - "This is the Parallax scheduler dashboard showing connected nodes"

2. **Show Provider Agent logs** (Terminal 2)
   - "Our provider agent exposes Parallax through an x402 payment gateway"

3. **Run Client Demo** (Terminal 3)
   ```bash
   cd agents/client && npm run demo
   ```
   - "Watch as the autonomous client discovers providers and makes payments"
   - Point out: discovery, selection, payment transaction, inference

4. **Show Dashboard** (http://localhost:3000)
   - Navigate to marketplace
   - Show provider cards
   - Enter a prompt in inference panel
   - Submit and show response
   - Check transaction history

5. **Show Blockchain Transaction**
   - Copy transaction signature from logs
   - Visit: https://explorer.solana.com/?cluster=devnet
   - Paste transaction signature
   - "This is the actual on-chain payment on Solana devnet"

---

## 🔧 Environment Configuration

### Provider Agent (.env)

```bash
# agents/provider/.env
PORT=4001
NETWORK=devnet
PROVIDER_WALLET_PRIVATE_KEY=your_base58_key

# THIS IS THE KEY LINE:
PARALLAX_SCHEDULER_URL=http://localhost:3001
PARALLAX_MODEL=Qwen/Qwen3-0.6B

BASIC_PRICE=0.01
STANDARD_PRICE=0.05
PREMIUM_PRICE=0.25
```

### Client Agent (.env)

```bash
# agents/client/.env
NETWORK=devnet
CLIENT_WALLET_PRIVATE_KEY=your_base58_key

# Budget
BUDGET_MAX_TOTAL=1.0
BUDGET_MAX_PER_REQUEST=0.1
```

### Dashboard (.env.local)

```bash
# parallaxpayx402/.env.local

# Point to Provider Agent (which connects to Parallax)
NEXT_PUBLIC_PROVIDER_ENDPOINT=http://localhost:4001

# Or point directly to Parallax
# NEXT_PUBLIC_PROVIDER_ENDPOINT=http://localhost:3001

# X402 Configuration
NEXT_PUBLIC_CDP_CLIENT_KEY=your_coinbase_key
NEXT_PUBLIC_RECEIVER_ADDRESS=your_solana_wallet
NEXT_PUBLIC_NETWORK=solana-devnet
```

---

## 🐛 Troubleshooting

### Parallax Won't Start

```bash
# Check Python version (need 3.11-3.13)
python3 --version

# Reinstall
cd parallax
pip uninstall parallax
pip install -e '.[mac]'  # or [gpu] for Linux

# Try with specific model
parallax run -m Qwen/Qwen3-0.6B --host 0.0.0.0
```

### Provider Can't Connect to Parallax

```bash
# Check Parallax is running
curl http://localhost:3001/health

# Check provider logs for:
# "🌊 Calling Parallax at http://localhost:3001"
# If you see "⚠️ Parallax not available", it's using mock

# Verify .env has:
# PARALLAX_SCHEDULER_URL=http://localhost:3001
```

### Client Demo Fails

```bash
# Make sure provider is running first
cd agents/provider
npm start

# Then run client
cd agents/client
npm run demo

# Check wallets have SOL
# Visit: https://faucet.solana.com
```

### Dashboard Connection Issues

```bash
# Check .env.local has correct endpoint
cat parallaxpayx402/.env.local

# Should see:
# NEXT_PUBLIC_PROVIDER_ENDPOINT=http://localhost:4001

# Restart dev server
npm run dev
```

---

## 📊 Expected Results

### Successful End-to-End Test

**Provider logs**:
```
🚀 Provider Agent running on port 4001
🌊 Calling Parallax at http://localhost:3001/v1/chat/completions
✅ Inference request completed in 1.23s
```

**Client logs**:
```
🔍 Discovering providers...
📍 Found 2 providers
🤖 Selected: ParallaxPay Primary Node
💳 Payment signature: 5xJ8k3...
✅ Received response: 87 tokens
📊 Budget remaining: 0.999 SOL
```

**Dashboard**:
- Marketplace shows provider cards
- Inference panel accepts prompts
- Responses display correctly
- Transaction history updates
- No console errors

---

## 🏆 Hackathon Tracks Coverage

Your end-to-end demo covers:

1. **Parallax Ecosystem Track** ($5,000)
   - ✅ Uses Gradient Parallax for distributed inference
   - ✅ Scheduler coordination
   - ✅ Multi-node support

2. **x402 AI Agent Track** ($10,000)
   - ✅ Autonomous client agent
   - ✅ Provider discovery
   - ✅ Automatic payments

3. **Trustless AI Agent Track** ($10,000)
   - ✅ On-chain verification
   - ✅ Reputation system
   - ✅ Transparent pricing

4. **x402 API Track** ($10,000)
   - ✅ x402 middleware
   - ✅ Payment-protected content
   - ✅ Three pricing tiers

**Total potential**: $35,000+ 🎉

---

## 🎥 Video Demo Script

**Opening** (30 sec):
> "ParallaxPay is a decentralized AI marketplace that combines Gradient Parallax distributed inference with x402 micropayments on Solana. Let me show you how it works."

**Parallax** (1 min):
> "First, we have Gradient Parallax running. This is a distributed LLM inference engine that coordinates across multiple GPU nodes. [Show Parallax UI at :3002]"

**Provider Agent** (1 min):
> "Our provider agent exposes Parallax through an x402 payment gateway. It handles pricing, payments, and reputation. [Show provider logs]"

**Autonomous Client** (2 min):
> "Now watch the autonomous client agent. It discovers providers, evaluates reputation, negotiates pricing, and makes automatic Solana payments for compute. [Run demo, show logs]"

**Dashboard** (2 min):
> "The marketplace UI shows available providers. Users can select a provider and quality tier, enter prompts, and get AI responses. [Demo inference]"

**Blockchain** (1 min):
> "Every transaction is on-chain. Here's the Solana transaction that just paid for that inference request. [Show Solana Explorer]"

**Closing** (30 sec):
> "ParallaxPay creates a truly decentralized AI economy where autonomous agents trade compute using micropayments. Thanks for watching!"

---

## 📝 Summary

### To run end-to-end with Parallax:

```bash
# 1. Install Parallax (one time)
git clone https://github.com/GradientHQ/parallax.git
cd parallax
pip install -e '.[mac]'  # or [gpu]

# 2. Start everything
parallax run --host 0.0.0.0              # Terminal 1
cd agents/provider && npm start           # Terminal 2
cd agents/client && npm run demo          # Terminal 3
cd parallaxpayx402 && npm run dev         # Terminal 4

# 3. Test
# - Visit http://localhost:3000
# - Try marketplace inference
# - Check Solana Explorer for transactions
```

### Parallax is already implemented! ✅

The integration is complete in:
- `agents/provider/src/services/parallax.ts` - Service layer
- `agents/provider/src/routes/inference.ts` - API endpoint
- Provider `.env.example` - Configuration template

You just need to install and run Parallax itself!

---

**Built for X402 Solana Hackathon** 🚀
