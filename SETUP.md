# ParallaxPay Setup Guide

Clean repository with frontend connected to Parallax AI inference.

## Quick Start

### 1. Install Dependencies

```bash
# Frontend
cd parallaxpayx402
npm install
cp .env.example .env.local

# Provider Agent
cd ../agents/provider
npm install
cp .env.example .env
# Edit .env with your configuration
```

### 2. Start Services

```bash
# Terminal 1: Provider Agent
cd agents/provider
npm start
# Runs on http://localhost:4001

# Terminal 2: Frontend
cd parallaxpayx402
npm run dev
# Runs on http://localhost:3000
```

### 3. Open Browser

```
http://localhost:3000
```

## Project Structure

```
parallaxpay/
├── agents/
│   ├── provider/     # AI inference backend (Express.js)
│   └── client/       # Client agent (for testing)
├── parallaxpayx402/  # Next.js frontend
├── parallax/         # Gradient Parallax (submodule)
└── README.md
```

## Current State

- ✅ Frontend working with Parallax provider
- ✅ Clean middleware (no payment gates)
- ✅ Solana wallet integration
- ✅ Beautiful UI
- ⏸️ No x402 integration (ready for fresh implementation)

## Ready For

- Fresh x402 implementation
- Custom payment protocol
- Hackathon demo
