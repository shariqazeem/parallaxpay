# 🚀 Gradient Parallax Integration Guide

## Overview

Your ParallaxPay X402 project is now integrated with **Gradient Parallax** - a fully decentralized AI inference engine that enables distributed GPU computing across multiple nodes.

---

## What is Gradient Parallax?

Gradient Parallax is a decentralized inference engine that:
- Hosts local LLMs on personal devices
- Provides cross-platform support (Windows, Linux, macOS)
- Uses pipeline parallel model sharding
- Offers dynamic request scheduling and routing
- Powered by Lattica (P2P), SGLang (GPU), and MLX LM (Mac)

---

## Architecture

```
┌─────────────────┐
│  ParallaxPay    │
│  Frontend       │
│  (X402 + UI)    │
└────────┬────────┘
         │ HTTP Request
         ↓
┌─────────────────┐
│  X402           │
│  Middleware     │ ← Handles payment
└────────┬────────┘
         │ After Payment
         ↓
┌─────────────────┐
│  Parallax       │
│  Scheduler      │ ← Distributes work
│  :3001          │
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌────────┐
│ Node 1 │ │ Node 2 │ ← Distributed GPUs
│ GPU    │ │ GPU    │
└────────┘ └────────┘
```

---

## Setup Instructions

### Option 1: Use Your Existing Provider (Recommended for Demo)

Your inference provider at `localhost:4001` is already working. This is the simplest approach for the hackathon:

**Status**: ✅ Already configured
**Endpoint**: http://localhost:4001
**Environment**: `.env.local` already set

### Option 2: Set Up Full Gradient Parallax Cluster

For a complete distributed setup, follow these steps:

#### Step 1: Install Parallax

**For macOS (Apple Silicon):**
```bash
git clone https://github.com/GradientHQ/parallax.git
cd parallax
python3 -m venv ./venv
source ./venv/bin/activate
pip install -e '.[mac]'
```

**For Linux/WSL (GPU):**
```bash
git clone https://github.com/GradientHQ/parallax.git
cd parallax
pip install -e '.[gpu]'
```

**For Windows:**
```bash
# Download installer
# Install as administrator
# Run: parallax install
```

#### Step 2: Start Parallax Scheduler

**With Frontend** (recommended for setup):
```bash
parallax run --host 0.0.0.0
```

This starts:
- Scheduler on port 3001
- Web UI on port 3002

**Without Frontend** (API only):
```bash
parallax run -m Qwen/Qwen3-0.6B -n 2 --host 0.0.0.0
```

#### Step 3: Connect Worker Nodes

On each additional machine:

**Local Network:**
```bash
parallax join
```

**Public Network:**
```bash
parallax join -s {scheduler-address}
# Example:
# parallax join -s 12D3KooWLX7MWuzi1Txa5LyZS4eTQ2tPaJijheH8faHggB9SxnBu
```

#### Step 4: Verify Setup

```bash
# Check scheduler status
curl http://localhost:3001/health

# Test inference
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": false
  }'
```

---

## API Endpoints

### Parallax Scheduler API

**Base URL**: http://localhost:3001

**Health Check**:
```bash
GET /health
```

**Chat Completions** (OpenAI-compatible):
```bash
POST /v1/chat/completions
Content-Type: application/json

{
  "max_tokens": 256,
  "messages": [
    {"role": "user", "content": "Your prompt here"}
  ],
  "stream": false
}
```

**Inference** (Raw):
```bash
POST /v1/inference
Content-Type: application/json

{
  "model": "Qwen/Qwen3-0.6B",
  "prompt": "Your prompt",
  "max_tokens": 256,
  "temperature": 0.7
}
```

---

## ParallaxPay Integration

### Current Configuration

**File**: `parallaxpayx402/.env.local`
```bash
NEXT_PUBLIC_PROVIDER_ENDPOINT=http://localhost:4001
```

### To Use Parallax Scheduler

Change to:
```bash
NEXT_PUBLIC_PROVIDER_ENDPOINT=http://localhost:3001
```

### Content Pages

All three tiers (`/content/basic`, `/content/standard`, `/content/premium`) are configured to call:

```typescript
const providerEndpoint = process.env.NEXT_PUBLIC_PROVIDER_ENDPOINT || 'http://localhost:4001'

const response = await fetch(`${providerEndpoint}/v1/inference`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'Qwen/Qwen3-0.6B',
    prompt,
    max_tokens: 100, // varies by tier
    temperature: 0.7,
  }),
})
```

---

## Supported Models

Parallax supports many models via HuggingFace:

| Provider | Models | Best For |
|----------|--------|----------|
| Qwen | Qwen3, Qwen2.5 | General purpose, fast |
| DeepSeek | DeepSeek-V3.1, DeepSeek-R1 | Reasoning, coding |
| Meta Llama | Llama 3, 3.1, 3.2, 3.3 | Open source, reliable |
| MiniMax | MiniMax-M2 | Coding, agents |
| GLM | GLM-4.6 | Reasoning, coding |

**Default in ParallaxPay**: `Qwen/Qwen3-0.6B` (fast, efficient)

---

## Payment Flow with Parallax

1. **User visits tier page** → `/content/basic`
2. **X402 middleware** → Intercepts request
3. **Payment required** → Coinbase Pay modal
4. **User pays** → USDC on Solana
5. **Payment verified** → Session created
6. **Access granted** → Page loads
7. **User enters prompt** → Submits to UI
8. **API call** → Hits Parallax scheduler
9. **Distributed inference** → Across GPU nodes
10. **Result returned** → Displayed to user

---

## For Hackathon Demo

### Recommended Setup

**Option A: Single Machine (Easiest)**
```bash
# Your existing setup
# Provider on 4001
# Frontend on 3000
# Everything works!
```

**Option B: Show Parallax (Impressive)**
```bash
# Terminal 1: Parallax Scheduler
parallax run --host 0.0.0.0

# Terminal 2: Join local node
parallax join

# Terminal 3: ParallaxPay Frontend
cd parallaxpayx402
npm run dev
```

**Demo Script**:
> "ParallaxPay uses Gradient Parallax for distributed AI inference. The scheduler at localhost:3001 distributes work across multiple GPU nodes. Combined with X402 micropayments on Solana, this creates a truly decentralized AI marketplace."

---

## Environment Variables

### Complete .env.local

```bash
# Provider/Parallax Configuration
NEXT_PUBLIC_PROVIDER_ENDPOINT=http://localhost:3001
# OR for your existing provider:
# NEXT_PUBLIC_PROVIDER_ENDPOINT=http://localhost:4001

# X402 Payment Configuration
NEXT_PUBLIC_RECEIVER_ADDRESS=7oYKnwHxzXitcxJuPV7EP9mPaLbkubgcT3jZa63E1gWA
NEXT_PUBLIC_NETWORK=solana-devnet
NEXT_PUBLIC_FACILITATOR_URL=https://x402.org/facilitator
NEXT_PUBLIC_CDP_CLIENT_KEY=3uyu43EHCwgVIQx6a8cIfSkxp6cXgU30
```

---

## Troubleshooting

### Parallax Not Starting?

```bash
# Check Python version
python3 --version  # Should be 3.11-3.13

# Reinstall
pip uninstall parallax
pip install -e '.[mac]'  # or [gpu] for Linux
```

### Can't Connect Nodes?

```bash
# Check firewall
# Ensure port 3001 is open

# Check scheduler address
# Copy the multiaddress from scheduler logs
```

### API Not Responding?

```bash
# Test direct
curl http://localhost:3001/health

# Check logs
# Scheduler shows incoming requests

# Verify content pages are using correct endpoint
```

---

## Advanced: Custom Models

To use different models, update the content pages:

**File**: `app/content/premium/page.tsx`
```typescript
body: JSON.stringify({
  model: 'meta-llama/Llama-3.3-70B-Instruct',  // Change model
  prompt,
  max_tokens: 512,
  temperature: 0.7,
})
```

---

## Production Deployment

For mainnet/production:

1. **Scale Parallax**:
   - Multiple GPU nodes
   - Load balancing
   - Monitoring

2. **Update X402**:
   - Change to `solana-mainnet-beta`
   - Get production CDP keys
   - Configure real wallet

3. **Deploy Frontend**:
   - Vercel/Netlify
   - Update env vars
   - SSL/HTTPS

---

## Resources

- **Parallax GitHub**: https://github.com/GradientHQ/parallax
- **Parallax Docs**: (in GitHub README)
- **X402 Spec**: https://github.com/wit-ai/wit-http-402
- **Solana Docs**: https://docs.solana.com

---

## Quick Commands

```bash
# Start Parallax with UI
parallax run --host 0.0.0.0

# Start without UI
parallax run -m Qwen/Qwen3-0.6B -n 2

# Join node
parallax join -s <scheduler-address>

# Test API
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"max_tokens":100,"messages":[{"role":"user","content":"test"}]}'

# Start ParallaxPay
cd parallaxpayx402
npm run dev
```

---

## Summary

Your ParallaxPay X402 project is now ready to use Gradient Parallax for distributed AI inference:

- ✅ X402 payment protection
- ✅ Three pricing tiers
- ✅ Parallax API integration
- ✅ Distributed GPU support
- ✅ Solana blockchain verification

**You have a complete decentralized AI marketplace!** 🚀

---

**Built for X402 Solana Hackathon - Gradient Parallax Track** 🏆
