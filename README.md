# ParallaxPay 🚀

## Decentralized AI Inference Marketplace

**The world's first autonomous AI agent marketplace powered by Gradient Parallax, x402, and Solana.**

[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?logo=solana)](https://solana.com)
[![x402](https://img.shields.io/badge/x402-Protocol-00D9FF)](https://x402.org)
[![Gradient](https://img.shields.io/badge/Gradient-Parallax-FF6B6B)](https://github.com/GradientHQ/parallax)

---

## What is ParallaxPay?

ParallaxPay is a **decentralized marketplace** where AI agents can autonomously:

- 🤖 **Provide AI inference services** using distributed GPU networks (Gradient Parallax)
- 💰 **Pay for AI compute** using instant micropayments (x402 on Solana)
- 🔒 **Build trust** through on-chain reputation tracking
- ⚡ **Transact instantly** with 400ms finality and $0.00025 fees

### The Problem We Solve

Traditional AI APIs require:
- Subscriptions and API keys
- Centralized infrastructure
- Manual payment processing
- No agent autonomy

### Our Solution

**Agent-to-agent AI commerce** where:
- AI agents discover inference providers autonomously
- Payments happen automatically via x402 (HTTP 402 Payment Required)
- No subscriptions - pure pay-per-inference
- Fully decentralized using Gradient Parallax for compute
- Instant settlement on Solana blockchain

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│               ParallaxPay Ecosystem                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      x402 Payments     ┌──────────────┐  │
│  │   Client     │◄────────(USDC)────────►│  Inference   │  │
│  │   Agent      │                         │  Provider    │  │
│  │  (Buys AI)   │   Discovers Providers   │   Agent      │  │
│  └──────────────┘                         └──────────────┘  │
│         │                                         │          │
│         │         Gradient Parallax Network       │          │
│         ▼                                         ▼          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Distributed LLM Inference (Qwen, DeepSeek, Llama)  │   │
│  │  • Pipeline parallel model sharding                  │   │
│  │  • Dynamic request routing                           │   │
│  │  • Cross-platform support (GPU/Mac)                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Solana x402 Settlement Layer               │   │
│  │  • 400ms transaction finality                        │   │
│  │  • $0.00025 fees per transaction                     │   │
│  │  • On-chain reputation oracle                        │   │
│  │  • USDC micropayments                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Blockchain & Payments
- **Solana** - Ultra-fast blockchain (400ms finality)
- **x402 Protocol** - HTTP 402 payment standard
- **Faremeter SDK** - x402 Solana integration
- **USDC** - Stablecoin micropayments

### AI Infrastructure
- **Gradient Parallax** - Distributed LLM inference
- **Qwen/DeepSeek/Llama** - State-of-the-art LLMs
- **SGLang** - GPU backend
- **MLX** - Mac backend

### Application Stack
- **Next.js 14** - React framework
- **TypeScript** - Type-safe development
- **TailwindCSS** - Styling
- **Express.js** - API server
- **Solana Web3.js** - Blockchain interaction

---

## Project Structure

```
parallaxpay/
├── apps/
│   ├── inference-provider/    # Provider agent exposing x402 AI endpoints
│   ├── client-agent/          # Client agent consuming AI services
│   └── dashboard/             # Next.js marketplace dashboard
├── packages/
│   ├── shared/                # Shared utilities and types
│   ├── x402-solana/           # x402 + Solana payment handlers
│   └── reputation/            # On-chain reputation oracle
├── docs/
│   ├── ARCHITECTURE.md        # System architecture
│   ├── API.md                 # API documentation
│   └── DEPLOYMENT.md          # Deployment guide
└── README.md
```

---

## Quick Start

### Prerequisites

- Node.js >= 18
- Python >= 3.11 (for Gradient Parallax)
- Solana CLI
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/parallaxpay.git
cd parallaxpay
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add:
- Solana wallet private keys
- USDC mint addresses (devnet/mainnet)
- Facilitator URL

### 4. Install Gradient Parallax

```bash
# For macOS (Apple Silicon)
git clone https://github.com/GradientHQ/parallax.git
cd parallax
python3 -m venv ./venv
source ./venv/bin/activate
pip install -e '.[mac]'

# For Linux (GPU)
pip install -e '.[gpu]'
```

### 5. Fund Your Wallets

```bash
# Airdrop SOL on devnet
solana airdrop 2 <YOUR_WALLET_ADDRESS> --url devnet

# Get devnet USDC from Circle faucet
# Visit: https://faucet.circle.com/
```

### 6. Start the Stack

```bash
# Terminal 1: Start Parallax scheduler
cd parallax
parallax run --host 0.0.0.0

# Terminal 2: Start inference provider
npm run provider:dev

# Terminal 3: Start client agent
npm run agent:dev

# Terminal 4: Start dashboard
npm run dashboard:dev
```

---

## Core Features

### 1. Inference Provider Agent

Autonomous agent that:
- Runs Gradient Parallax node with LLM models
- Exposes x402-protected inference endpoints
- Sets dynamic pricing based on model complexity
- Auto-accepts USDC payments via Solana
- Builds reputation through successful completions

**Example Request:**
```bash
curl -X POST http://localhost:3001/v1/inference \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen3-0.6B",
    "prompt": "Explain quantum computing",
    "max_tokens": 512
  }'

# Returns: 402 Payment Required with payment details
```

### 2. Client Agent

Autonomous agent that:
- Discovers available inference providers
- Compares pricing and model availability
- Autonomously pays via x402 using USDC
- Retries failed requests with backoff
- Rates provider quality

**Example Usage:**
```typescript
import { ClientAgent } from './client-agent'

const agent = new ClientAgent({
  wallet: keypair,
  network: 'devnet'
})

const result = await agent.queryInference({
  prompt: 'Write a poem about Solana',
  maxPrice: 0.001, // $0.001 max
  model: 'Qwen/Qwen3-0.6B'
})

console.log(result.completion)
```

### 3. Reputation Oracle

On-chain tracking of:
- Total transactions per provider
- Success/failure rates
- Average response time
- Payment reliability
- Quality scores (based on client ratings)

### 4. Marketplace Dashboard

Next.js dashboard showing:
- Live provider directory
- Real-time transaction feed
- Reputation leaderboard
- Payment history
- Analytics and metrics

---

## Hackathon Tracks

This project competes in **THREE** tracks:

### 1. Parallax Eco Track ($5,000)
**Best agent built on Gradient Parallax**
- ✅ Uses Parallax for distributed LLM inference
- ✅ Showcases multi-node deployment
- ✅ Demonstrates practical AI marketplace use case

### 2. Best x402 Agent Application ($10,000)
**Practical AI agent using x402**
- ✅ Autonomous agent-to-agent payments
- ✅ Real-world AI inference marketplace
- ✅ Seamless x402 payment integration

### 3. Best Trustless Agent ($10,000)
**Autonomous agents with reputation**
- ✅ On-chain reputation tracking
- ✅ Verifiable payment history
- ✅ Trustless agent discovery

**Total Prize Potential: $25,000**

---

## Why ParallaxPay Wins

### Innovation
- **First-ever** decentralized AI inference marketplace
- Combines 3 cutting-edge technologies (Parallax + x402 + Solana)
- Solves real problems in AI agent commerce

### Technical Excellence
- Production-ready architecture
- Comprehensive error handling
- Scalable design
- Well-documented codebase

### Real-World Impact
- Enables autonomous AI agent economy
- Removes barriers to AI access
- Creates new revenue models for GPU providers
- Showcases Solana's speed advantage

### Completeness
- Full-stack implementation
- Working demo
- Comprehensive documentation
- Open-source and extensible

---

## Roadmap

### Phase 1: MVP (Hackathon) ✅
- Single provider + client setup
- Basic x402 payment flow
- Simple reputation tracking
- Dashboard MVP

### Phase 2: Multi-Provider Network
- Provider discovery protocol
- Load balancing
- Advanced reputation algorithms
- Multi-token support (SOL, CASH, etc.)

### Phase 3: Production Launch
- Mainnet deployment
- Advanced analytics
- Provider staking mechanism
- SLA enforcement

### Phase 4: Ecosystem Growth
- SDK for easy provider onboarding
- Mobile client support
- Cross-chain settlements
- Governance token

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## License

MIT License - see [LICENSE](./LICENSE)

---

## Acknowledgments

Built with:
- [Gradient Parallax](https://github.com/GradientHQ/parallax)
- [x402 Protocol](https://x402.org)
- [Solana](https://solana.com)
- [Faremeter SDK](https://corbits.dev)

---

## Team

Built for the **Solana x402 Hackathon** (Oct 28 - Nov 11, 2025)

---

## Contact

- Twitter: [@parallaxpay](https://twitter.com/parallaxpay)
- Discord: [Join our server](#)
- Email: team@parallaxpay.dev

---

**Built with 🔥 on Solana**
