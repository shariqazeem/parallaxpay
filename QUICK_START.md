# ⚡ ParallaxPay - Quick Start

## Is Parallax Implemented? ✅ YES!

**Location**: `agents/provider/src/services/parallax.ts`

The provider agent already calls Parallax at `http://localhost:3001`. You just need to install and run Parallax itself!

---

## 🚀 Fastest Demo (2 minutes)

```bash
# Terminal 1: Provider Agent
cd agents/provider
npm install
npm start  # Auto-builds then starts

# Terminal 2: Client Agent Demo
cd agents/client
npm install
npm run demo  # Auto-compiles and runs
```

**Watch**: Autonomous agents discover, pay, and trade AI compute on Solana!

---

## 🌊 With Real Parallax (5 minutes)

### 1. Install Parallax (first time only)

**macOS**:
```bash
git clone https://github.com/GradientHQ/parallax.git
cd parallax
python3 -m venv venv
source venv/bin/activate
pip install -e '.[mac]'
```

**Linux**:
```bash
git clone https://github.com/GradientHQ/parallax.git
cd parallax
python3 -m venv venv
source venv/bin/activate
pip install -e '.[gpu]'
```

### 2. Run Everything

```bash
# Terminal 1: Parallax Scheduler
parallax run --host 0.0.0.0

# Terminal 2: Provider Agent (connects to Parallax)
cd agents/provider
npm start

# Terminal 3: Client Demo
cd agents/client
npm run demo

# Terminal 4: Dashboard (optional)
cd parallaxpayx402
npm run dev
```

### 3. Test It

```bash
# Verify Parallax
curl http://localhost:3001/health

# Try inference
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"max_tokens":100,"messages":[{"role":"user","content":"Hello!"}],"stream":false}'
```

---

## 🎯 What You Get

✅ **Gradient Parallax** - Distributed AI inference
✅ **x402 Protocol** - HTTP 402 micropayments
✅ **Autonomous Agents** - Client discovers & pays providers
✅ **Solana Blockchain** - Real on-chain transactions
✅ **Next.js Dashboard** - Beautiful marketplace UI
✅ **Reputation System** - On-chain provider ratings

---

## 📂 Project Structure

```
parallaxpay/
├── agents/
│   ├── provider/          # Provider agent (port 4001)
│   │   └── src/services/parallax.ts  # ← Parallax integration here!
│   └── client/            # Client agent (autonomous)
├── parallaxpayx402/       # Next.js dashboard (port 3000)
└── scripts/               # Setup automation
```

---

## 🔧 Key Configuration

### Provider connects to Parallax

**File**: `agents/provider/.env`
```bash
PARALLAX_SCHEDULER_URL=http://localhost:3001
PARALLAX_MODEL=Qwen/Qwen3-0.6B
```

### Dashboard connects to Provider

**File**: `parallaxpayx402/.env.local`
```bash
NEXT_PUBLIC_PROVIDER_ENDPOINT=http://localhost:4001
```

---

## 🐛 Quick Fixes

**Parallax not starting?**
```bash
python3 --version  # Need 3.11-3.13
cd parallax && pip install -e '.[mac]'
```

**Provider can't reach Parallax?**
```bash
curl http://localhost:3001/health
# If fails, Parallax isn't running
```

**Client demo fails?**
```bash
# Make sure provider is running first!
cd agents/provider && npm start
```

---

## 🎬 Demo Flow

1. **Start Parallax**: `parallax run --host 0.0.0.0`
2. **Start Provider**: `cd agents/provider && npm start`
3. **Run Client**: `cd agents/client && npm run demo`
4. **Show Dashboard**: Visit http://localhost:3000/marketplace
5. **Show Blockchain**: Copy transaction → https://explorer.solana.com/?cluster=devnet

---

## 🏆 Hackathon Tracks

✅ Parallax Ecosystem ($5k) - Uses distributed inference
✅ x402 AI Agent ($10k) - Autonomous client agent
✅ Trustless AI Agent ($10k) - On-chain reputation
✅ x402 API ($10k) - Payment-protected content

**Total**: $35,000+ potential 🎉

---

## 📖 Full Docs

- **Complete guide**: `END_TO_END_TESTING.md`
- **Parallax setup**: `parallaxpayx402/GRADIENT_PARALLAX_SETUP.md`
- **Provider docs**: `agents/provider/README.md`
- **Client docs**: `agents/client/README.md`

---

## 💡 One-Liner

> ParallaxPay = Gradient Parallax + x402 + Solana = Decentralized AI Marketplace

**Let's win this hackathon!** 🚀
