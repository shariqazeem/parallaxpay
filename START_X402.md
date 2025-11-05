# ParallaxPay x402 Integration - Quick Start Guide

## What Was Fixed

### Issues Identified:
1. **Port Conflict**: The x402 facilitator's example server was running on port 4001, conflicting with the provider agent
2. **Wrong Facilitator URL**: Next.js app was configured to use external facilitator instead of local one
3. **Browser Incompatibility**: Using Node.js `crypto` module in browser code

### Solutions Applied:
1. Changed facilitator example server port from 4001 to 4005
2. Updated `.env.local` to point to `http://localhost:3002` for facilitator
3. Fixed crypto imports to use Web Crypto API for browser compatibility

## Architecture Overview

```
┌──────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│   Next.js App    │────▶│  Provider Agent  │────▶│   Facilitator     │
│   (Port 3000)    │     │   (Port 4001)    │     │   (Port 3002)     │
│                  │     │                  │     │                   │
│  • Phantom       │     │  • x402 Middleware│     │  • Verify Payment │
│  • Payment UI    │     │  • AI Inference  │     │  • Settle Tx      │
│  • Auto x402     │     │  • Mock/Parallax │     │  • Nonce DB       │
└──────────────────┘     └──────────────────┘     └───────────────────┘
        │                         │                         │
        │                         │                         │
        └─────────────────────────┴─────────────────────────┘
                              Solana Devnet
```

## Starting All Services

### Option 1: Manual Start (Recommended for Testing)

#### Terminal 1: Start Facilitator
```bash
cd x402_facilitator
npm run dev:facilitator
```

Wait for: `✅ Facilitator App running on port 3002`

#### Terminal 2: Start Provider Agent
```bash
cd agents/provider
npm run dev
```

Wait for: `🚀 ParallaxPay Provider Agent Started 🚀`

#### Terminal 3: Start Next.js App
```bash
cd parallaxpayx402
npm run dev
```

Wait for: `Ready on http://localhost:3000`

### Option 2: Quick Start Script

```bash
chmod +x start-all.sh
./start-all.sh
```

## Testing the x402 Flow

### 1. Check All Services Are Running

```bash
# Check facilitator
curl http://localhost:3002/health

# Check provider
curl http://localhost:4001/health

# Check Next.js
curl http://localhost:3000
```

### 2. Test Provider Without Payment (DISABLE_X402=true)

```bash
curl -X POST http://localhost:4001/v1/inference \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen3-0.6B",
    "prompt": "What is Solana?",
    "max_tokens": 100,
    "temperature": 0.7
  }'
```

Expected: JSON response with AI completion

### 3. Test Browser Integration

1. Open http://localhost:3000
2. Click "Try Basic ($0.01)"
3. Click "Connect Wallet"
4. Approve Phantom connection
5. Enter a prompt: "Tell me about AI"
6. Click "✨ Generate AI Response"

**Expected Flow:**
- Wallet connected ✅
- Payment request created automatically
- Transaction signed by Phantom
- Provider receives payment
- AI response generated
- Transaction link shown

### 4. Enable x402 Payment Protection

To enable actual payment verification:

```bash
# Edit agents/provider/.env
DISABLE_X402=false  # Change from true to false
```

Restart the provider, then test again. The provider will now require valid x402 payments.

## Environment Configuration

### Facilitator (x402_facilitator/.env)
```bash
FACILITATOR_PORT=3002
SERVER_PORT=4005  # Changed from 4001 to avoid conflict
```

### Provider (agents/provider/.env)
```bash
PORT=4001
FACILITATOR_URL=http://localhost:3002
DISABLE_X402=true  # Set to false for production
```

### Next.js (parallaxpayx402/.env.local)
```bash
NEXT_PUBLIC_FACILITATOR_URL=http://localhost:3002  # Fixed
NEXT_PUBLIC_PROVIDER_ENDPOINT=http://localhost:4001
```

## Key Files Modified

### 1. Browser Crypto Fix
**File:** `parallaxpayx402/lib/x402/payment.ts`
```typescript
// Before:
import crypto from 'crypto';
const nonce = crypto.randomBytes(32).toString('hex');

// After:
// Browser-compatible random bytes
const nonceBytes = new Uint8Array(32);
window.crypto.getRandomValues(nonceBytes);
const nonce = Array.from(nonceBytes)
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');
```

### 2. Facilitator URL Fix
**File:** `parallaxpayx402/.env.local`
```bash
# Before:
NEXT_PUBLIC_FACILITATOR_URL=https://x402.org/facilitator

# After:
NEXT_PUBLIC_FACILITATOR_URL=http://localhost:3002
```

## Troubleshooting

### Port Already in Use
```bash
# Kill all processes on a port
lsof -ti :4001 | xargs kill -9

# Or kill by name
pkill -f "tsx watch"
pkill -f "x402_facilitator"
```

### Wallet Connection Issues
- Ensure Phantom is installed and unlocked
- Make sure you're on Devnet network
- Check browser console for errors

### Payment Failures
- Verify facilitator is running: `curl http://localhost:3002/health`
- Check facilitator logs for verification errors
- Ensure wallet has SOL: `solana balance <ADDRESS> --url devnet`

### No AI Response
- Check if Parallax is running (or mock mode is enabled)
- Provider logs will show: `⚠️ Parallax not available, returning mock response`
- This is expected for demo purposes

## Payment Flow Details

### 1. Client Side (Browser)
```typescript
// Create wallet interface
const wallet = await createPhantomWallet();

// Wrap fetch with automatic payment handling
const fetchWithPayment = createX402Fetch({
  wallet,
  connection,
  onPaymentRequired: (amount) => console.log(`Payment required: ${amount} SOL`),
  onPaymentCreated: (sig) => console.log(`Payment sent: ${sig}`)
});

// Make request - payment happens automatically on 402 response
const response = await fetchWithPayment('/v1/inference', {
  method: 'POST',
  body: JSON.stringify({ prompt: 'Hello', ... })
});
```

### 2. Provider Side (Express)
```typescript
// x402 middleware checks for payment
app.post('/v1/inference', x402Middleware, async (req, res) => {
  // If no payment: return 402 with requirements
  // If payment exists: verify with facilitator
  // If valid: process request
});
```

### 3. Facilitator Side
```typescript
// Verify endpoint
POST /verify
- Check nonce not used
- Verify signature
- Mark nonce as used

// Settle endpoint
POST /settle
- Deserialize transaction
- Add facilitator signature
- Broadcast to Solana
- Return tx signature
```

## Next Steps

1. ✅ All services running on correct ports
2. ✅ Browser crypto compatibility fixed
3. ✅ Facilitator connected properly
4. ⏳ Test with actual Phantom wallet payments
5. ⏳ Deploy to production with real payments

## Support

- Check logs in `/tmp/facilitator.log` and `/tmp/provider.log`
- Review facilitator nonce DB: `x402_facilitator/src/facilitator/nonce.db`
- Check Solana transactions: https://explorer.solana.com/?cluster=devnet
