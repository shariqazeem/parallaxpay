# X402 QuickStart Guide - ParallaxPay

## ✅ What We Have Now

1. **x402_facilitator/** - The x402 Express Server template (ready!)
2. **agents/provider/** - Your provider agent (needs x402 middleware update)
3. **agents/client/** - Your client agent (needs @faremeter/fetch)
4. **parallaxpayx402/** - Your Next.js dashboard (works as-is)

## 🎯 Implementation Steps (2-3 hours)

### Step 1: Configure Facilitator (15 min)

```bash
cd x402_facilitator

# Copy environment template
cp env.example .env

# Edit .env with your keys
nano .env
```

**Required in `.env`:**
```env
# Facilitator Configuration
FACILITATOR_PORT=3002
FACILITATOR_PRIVATE_KEY=<your_facilitator_private_key>
SOLANA_RPC_URL=https://api.devnet.solana.com
SIMULATE_TRANSACTIONS=false

# Server Configuration
SERVER_PORT=4001
FACILITATOR_URL=http://localhost:3002
MERCHANT_SOLANA_ADDRESS=9qzmG8vPymc2CAMchZgq26qiUFq4pEfTx6HZfpMhh51y

# Network
SOLANA_NETWORK=devnet
```

**Generate facilitator wallet:**
```bash
solana-keygen new --outfile facilitator-keypair.json
# Fund it with SOL for gas fees
solana airdrop 2 <FACILITATOR_PUBLIC_KEY> --url devnet
```

**Start facilitator:**
```bash
npm start  # Starts on port 3002
```

### Step 2: Update Provider Agent (45 min)

**File: `agents/provider/src/middleware/x402.ts`**

Replace entire content with:

```typescript
import { Request, Response, NextFunction } from 'express';

export async function x402Middleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Check if bypass is enabled (for testing)
  if (process.env.DISABLE_X402 === 'true') {
    console.log('⚠️  X402 DISABLED');
    return next();
  }

  const paymentHeader = req.headers['x-payment'] as string;

  // No payment? Return 402 with instructions
  if (!paymentHeader) {
    return res.status(402).json({
      error: 'Payment Required',
      protocol: 'x402',
      recipient: process.env.PROVIDER_WALLET_ADDRESS || '9qzmG8vPymc2CAMchZgq26qiUFq4pEfTx6HZfpMhh51y',
      amount: '10000000', // 0.01 SOL in lamports
      facilitator: 'http://localhost:3002',
      instructions: [
        '1. Create Solana transaction (client → provider)',
        '2. Sign transaction with your wallet',
        '3. Sign authorization payload',
        '4. Send both in X-Payment header',
        '5. Retry request'
      ]
    });
  }

  try {
    // Parse payment
    const payment = JSON.parse(paymentHeader);

    console.log('🔍 Verifying payment with facilitator...');

    // Forward to facilitator for verification
    const verifyResponse = await fetch('http://localhost:3002/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentRequest: JSON.stringify(payment) })
    });

    if (!verifyResponse.ok) {
      return res.status(402).json({
        error: 'Payment verification failed',
        details: await verifyResponse.text()
      });
    }

    const verifyData = await verifyResponse.json();

    if (!verifyData.success || !verifyData.data.verified) {
      return res.status(402).json({
        error: 'Invalid payment'
      });
    }

    console.log('💰 Settling payment with facilitator...');

    // Forward to facilitator for settlement
    const settleResponse = await fetch('http://localhost:3002/settle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentRequest: JSON.stringify(payment) })
    });

    if (!settleResponse.ok) {
      return res.status(402).json({
        error: 'Payment settlement failed'
      });
    }

    const settleData = await settleResponse.json();

    if (!settleData.success) {
      return res.status(402).json({
        error: 'Transaction broadcast failed'
      });
    }

    console.log('✅ Payment settled:', settleData.data.transactionSignature);

    // Payment verified and settled - allow request
    (req as any).paymentProof = settleData.data.transactionSignature;
    next();

  } catch (error: any) {
    console.error('❌ x402 middleware error:', error);
    return res.status(500).json({
      error: 'Payment processing error',
      message: error.message
    });
  }
}
```

**Update `.env`:**
```env
# Set to false to enable x402
DISABLE_X402=false

# Provider wallet
PROVIDER_WALLET_ADDRESS=9qzmG8vPymc2CAMchZgq26qiUFq4pEfTx6HZfpMhh51y

# Point to facilitator
FACILITATOR_URL=http://localhost:3002
```

**Rebuild and restart:**
```bash
cd agents/provider
npm run build
npm start  # Port 4001
```

### Step 3: Set Up Client Agent (45 min)

**Install dependencies:**
```bash
cd agents/client
npm install @faremeter/fetch @solana/web3.js bs58
```

**Create test client:**
```typescript
// agents/client/src/test-payment.ts
import { wrap } from '@faremeter/fetch';
import { Connection, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

// Load client wallet
const clientPrivateKey = bs58.decode(process.env.CLIENT_PRIVATE_KEY!);
const clientWallet = Keypair.fromSecretKey(clientPrivateKey);

// Solana connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Wrap fetch with x402 payment logic
const fetchWithPayer = wrap(fetch, {
  payer: clientWallet,
  connection,
  network: 'devnet' as any
});

// Test AI inference with automatic payment
async function testInference() {
  console.log('🤖 Testing AI inference with auto-payment...');
  console.log('Wallet:', clientWallet.publicKey.toString());

  try {
    const response = await fetchWithPayer('http://localhost:4001/v1/inference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'Qwen/Qwen3-0.6B',
        prompt: 'Tell me a joke about AI and payments',
        max_tokens: 100,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ AI Response:', data.completion);
    console.log('📊 Metadata:', data.metadata);

    return data;

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run test
testInference().then(() => {
  console.log('🎉 Test completed successfully!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Test failed:', err);
  process.exit(1);
});
```

**Generate client wallet:**
```bash
# In agents/client/
solana-keygen new --outfile client-keypair.json
# Get the base58 private key
cat client-keypair.json  # Copy the array

# Fund client
solana airdrop 1 <CLIENT_PUBLIC_KEY> --url devnet
```

**Add to `.env`:**
```env
CLIENT_PRIVATE_KEY=<base58_private_key>
```

**Run test:**
```bash
npx ts-node src/test-payment.ts
```

### Step 4: Test Complete Flow (15 min)

**Start all services:**

```bash
# Terminal 1: Parallax
./start-parallax.sh

# Terminal 2: Facilitator
cd x402_facilitator
npm start

# Terminal 3: Provider
cd agents/provider
npm start

# Terminal 4: Client test
cd agents/client
npx ts-node src/test-payment.ts
```

**Expected output:**

**Client (Terminal 4):**
```
🤖 Testing AI inference with auto-payment...
Wallet: 7xK...abc
💳 Received 402, creating payment...
🔐 Signing transaction...
✅ Payment created
🔄 Retrying with payment header...
✅ AI Response: <completion>
📊 Metadata: {...}
🎉 Test completed successfully!
```

**Provider (Terminal 3):**
```
POST /v1/inference
⚠️  No payment header, returning 402
POST /v1/inference (with payment)
🔍 Verifying payment with facilitator...
✅ Payment verified
💰 Settling payment with facilitator...
✅ Payment settled: 4yF2kx...
🤖 Processing inference...
✅ Response sent
```

**Facilitator (Terminal 2):**
```
POST /verify
🔍 Checking signature...
✅ Signature valid
📝 Checking nonce...
✅ Nonce unused

POST /settle
🔒 Marking nonce as used
📡 Broadcasting transaction...
✅ Transaction confirmed: 4yF2kx...
```

## 🎯 Troubleshooting

### Facilitator won't start
- Check `FACILITATOR_PRIVATE_KEY` is valid base58
- Ensure port 3002 is available
- Fund facilitator wallet with SOL

### Client payment fails
- Check client wallet has SOL
- Verify facilitator URL is correct
- Check provider is returning proper 402 response

### Provider can't verify payment
- Ensure facilitator is running
- Check facilitator URL in provider `.env`
- Look at facilitator logs for errors

## 📋 Ports Summary

- **3001**: Parallax (AI inference engine)
- **3002**: Facilitator (payment verification)
- **4001**: Provider Agent (x402 protected API)
- **3000**: Next.js Dashboard (monitoring)

## 🎓 Understanding the Flow

1. **Client calls provider** (no payment)
   ```
   Client → Provider: POST /v1/inference
   Provider → Client: 402 Payment Required
   ```

2. **@faremeter/fetch auto-pays**
   ```
   @faremeter detects 402
   Creates + signs transaction
   Retries with X-Payment header
   ```

3. **Provider verifies & settles**
   ```
   Provider → Facilitator: POST /verify
   Facilitator: ✅ Valid
   Provider → Facilitator: POST /settle
   Facilitator: Broadcasts to Solana
   ```

4. **Instant settlement**
   ```
   Solana: Client SOL → Provider wallet
   Provider → Client: 200 OK + AI response
   ```

## 📊 Key Advantages

✅ **TRUE instant finality** - Funds move on-chain immediately
✅ **Fully autonomous** - No human clicking required
✅ **Replay protection** - Nonce system prevents double-spends
✅ **Gas sponsorship** - Facilitator pays transaction fees
✅ **Perfect for agents** - Machine-to-machine commerce

## 🚀 Next Steps

1. **Complete Step 1-4** - Get basic flow working
2. **Add to client agent** - Integrate with your existing agent logic
3. **Test edge cases** - Insufficient funds, invalid payments, etc.
4. **Deploy** - Move to mainnet for real payments
5. **Scale** - Add multiple providers, load balancing, etc.

## 📚 Resources

- **Implementation Guide**: See `X402_IMPLEMENTATION_GUIDE.md`
- **x402 Template README**: See `x402_facilitator/README.md`
- **Template Setup**: See `x402_facilitator/SETUP.md`
- **Test Scripts**: See `x402_facilitator/test-*.mjs`

---

**Status**: Ready to implement
**Time**: 2-3 hours
**Difficulty**: Medium

Good luck with your hackathon! 🎉
