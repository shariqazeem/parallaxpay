# X402 Implementation Guide - Agent-to-Agent Payments

## Architecture Overview

Based on the x402 Express Server template, here's how ParallaxPay should implement TRUE agent-to-agent payments:

```
ClientAgent (agents/client/)
    └─> Uses @faremeter/fetch
    └─> Automatically handles 402 responses
    └─> Signs & pays with wallet
    └─> Retries with X-Payment header

                ↓

ProviderAgent (agents/provider/ - port 4001)
    └─> x402 middleware checks X-Payment header
    └─> Forwards to Facilitator for verification
    └─> Returns AI inference if valid

                ↓

Facilitator Service (NEW - port 3002)
    └─> Verifies payment signatures
    └─> Checks nonce (replay protection)
    └─> Adds fee payer signature (sponsors gas)
    └─> Broadcasts to Solana
    └─> Returns success/failure

                ↓

Solana Blockchain
    └─> Instant settlement
    └─> Client SOL → Provider wallet
    └─> Facilitator pays gas fees
```

## Why This Approach?

**x402-next Package** (what we tried before):
- ❌ For human-to-machine payments
- ❌ Shows Coinbase Pay modal (requires human clicking)
- ❌ Not suitable for autonomous agents

**x402 Express Server** (correct approach):
- ✅ For machine-to-machine payments
- ✅ Fully programmatic (no UI)
- ✅ Agents sign & pay automatically
- ✅ TRUE instant finality (client funds move immediately)

## Implementation Steps

### Step 1: Install Dependencies

```bash
# Facilitator & Provider
cd agents/provider
npm install @solana/web3.js gill-solana bs58 express zod sqlite3 pm2

# Client Agent
cd ../client
npm install @faremeter/fetch @solana/web3.js
```

### Step 2: Create Facilitator Service

Create: `agents/facilitator/` (new directory)

**Key files needed:**
```
agents/facilitator/
├── src/
│   ├── index.ts          # Main facilitator server
│   ├── nonce-db.ts       # SQLite nonce tracking
│   ├── verify.ts         # Payment verification
│   └── settle.ts         # Transaction settlement
├── .env                  # Configuration
└── package.json
```

**Facilitator responsibilities:**
1. Verify client's signature on payment auth
2. Check nonce hasn't been used (replay protection)
3. Mark nonce as used immediately
4. Deserialize client-signed transaction
5. Add facilitator signature as fee payer (sponsor gas)
6. Broadcast to Solana
7. Return transaction signature

### Step 3: Update Provider Agent x402 Middleware

Update: `agents/provider/src/middleware/x402.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

export async function x402Middleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const paymentHeader = req.headers['x-payment'] as string;

  // If no payment, return 402 with requirements
  if (!paymentHeader) {
    return res.status(402).json({
      error: 'Payment Required',
      protocol: 'x402',
      recipient: process.env.PROVIDER_WALLET_ADDRESS,
      amount: '0.01', // 0.01 SOL for basic tier
      facilitator: 'http://localhost:3002', // Your facilitator
      instructions: [
        '1. Create Solana transaction (client -> provider)',
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

    // Forward to facilitator for verification
    const verifyResponse = await fetch('http://localhost:3002/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentRequest: payment })
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
        error: 'Invalid payment',
        details: verifyData
      });
    }

    // Forward to facilitator for settlement
    const settleResponse = await fetch('http://localhost:3002/settle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentRequest: payment })
    });

    if (!settleResponse.ok) {
      return res.status(402).json({
        error: 'Payment settlement failed'
      });
    }

    const settleData = await settleResponse.json();

    if (!settleData.success) {
      return res.status(402).json({
        error: 'Transaction broadcast failed',
        details: settleData
      });
    }

    console.log('✅ Payment settled:', settleData.data.transactionSignature);

    // Payment verified and settled - allow request
    req.paymentProof = settleData.data.transactionSignature;
    next();

  } catch (error) {
    console.error('❌ x402 middleware error:', error);
    return res.status(500).json({
      error: 'Payment processing error',
      message: error.message
    });
  }
}
```

### Step 4: Update Client Agent with @faremeter/fetch

Update: `agents/client/src/index.ts`

```typescript
import { wrap } from '@faremeter/fetch';
import { Connection, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

// Load client wallet
const clientPrivateKey = bs58.decode(process.env.CLIENT_PRIVATE_KEY);
const clientWallet = Keypair.fromSecretKey(clientPrivateKey);

// Solana connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// USDC mint (devnet)
const usdcMint = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

// Wrap fetch with x402 payment logic
const fetchWithPayer = wrap(fetch, {
  payer: clientWallet,
  usdcMint,
  connection,
  network: 'devnet'
});

// Example: Call provider AI inference
async function callAIInference(prompt: string) {
  try {
    console.log('🤖 Requesting AI inference...');

    const response = await fetchWithPayer('http://localhost:4001/v1/inference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'Qwen/Qwen3-0.6B',
        prompt,
        max_tokens: 100,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ AI response:', data.completion);

    return data;

  } catch (error) {
    console.error('❌ Inference failed:', error);
    throw error;
  }
}

// Test it
callAIInference('Tell me a joke about AI').then(result => {
  console.log('Success!', result);
}).catch(err => {
  console.error('Error:', err);
});
```

### Step 5: Payment Request Structure

The `@faremeter/fetch` wrapper will automatically create this structure:

```typescript
interface PaymentRequest {
  payload: {
    amount: string;           // Lamports (e.g., "10000000" = 0.01 SOL)
    recipient: string;         // Provider wallet address
    resourceId: string;        // "/v1/inference"
    resourceUrl: string;       // Full URL
    nonce: string;            // Unique hex string (replay protection)
    timestamp: number;        // Unix timestamp
    expiry: number;           // Expiration (timestamp + 5 minutes)
  };
  signature: string;          // Ed25519 signature (base58)
  clientPublicKey: string;    // Client's public key
  signedTransaction: string;  // Base64 serialized transaction
}
```

## How the Flow Works

### 1. Client Makes Request (No Payment)

```bash
ClientAgent → Provider: POST /v1/inference
                       (no X-Payment header)

Provider → ClientAgent: 402 Payment Required
                        {
                          error: "Payment Required",
                          recipient: "9qzmG8...",
                          amount: "0.01",
                          facilitator: "http://localhost:3002"
                        }
```

### 2. @faremeter/fetch Auto-Pays

```bash
@faremeter/fetch catches 402
  ↓
Creates payment request:
  1. Generates nonce
  2. Creates Solana transaction (client → provider)
  3. Signs transaction with client wallet
  4. Signs auth payload with client wallet
  ↓
Retries request with X-Payment header
```

### 3. Provider Verifies & Settles

```bash
Provider receives X-Payment header
  ↓
Provider → Facilitator: POST /verify
  ↓
Facilitator:
  1. Verifies signature
  2. Checks nonce not used
  ↓
Provider → Facilitator: POST /settle
  ↓
Facilitator:
  1. Marks nonce as used
  2. Deserializes transaction
  3. Adds fee payer signature
  4. Broadcasts to Solana
  5. Returns tx signature
  ↓
Provider → ClientAgent: 200 OK
                        { completion: "..." }
```

### 4. Instant Settlement

```bash
Solana Blockchain:
  ✅ Client SOL → Provider wallet (INSTANT)
  ✅ Facilitator pays gas fees
  ✅ Single atomic transaction
  ✅ No debt tracking needed
```

## Environment Variables

### Facilitator `.env`

```env
PORT=3002
FACILITATOR_PRIVATE_KEY=<base58_private_key>
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
```

### Provider `.env`

```env
PORT=4001
PROVIDER_WALLET_ADDRESS=9qzmG8vPymc2CAMchZgq26qiUFq4pEfTx6HZfpMhh51y
FACILITATOR_URL=http://localhost:3002
PARALLAX_SCHEDULER_URL=http://localhost:3001
```

### Client `.env`

```env
CLIENT_PRIVATE_KEY=<base58_private_key>
PROVIDER_URL=http://localhost:4001
SOLANA_RPC_URL=https://api.devnet.solana.com
```

## Testing the Flow

### 1. Generate Test Wallets

```bash
# Facilitator wallet
solana-keygen new --outfile facilitator-keypair.json

# Client wallet
solana-keygen new --outfile client-keypair.json

# Fund client with SOL (for payments)
solana airdrop 1 <CLIENT_PUBLIC_KEY> --url devnet
```

### 2. Start Services

```bash
# Terminal 1: Parallax
./start-parallax.sh

# Terminal 2: Facilitator
cd agents/facilitator
npm start

# Terminal 3: Provider
cd agents/provider
npm start

# Terminal 4: Client
cd agents/client
npm start
```

### 3. Watch the Logs

**Client logs:**
```
🤖 Requesting AI inference...
💳 No payment found, creating payment...
🔐 Signing transaction...
✅ Payment created
🔄 Retrying with payment header...
✅ AI response: <completion>
```

**Provider logs:**
```
POST /v1/inference
⚠️  No payment header, returning 402
POST /v1/inference (with payment)
🔍 Verifying payment with facilitator...
✅ Payment verified
🤖 Processing inference request...
✅ Response sent
```

**Facilitator logs:**
```
POST /verify
🔍 Verifying signature...
✅ Signature valid
📝 Checking nonce...
✅ Nonce unused
POST /settle
🔒 Marking nonce as used...
📡 Broadcasting transaction...
✅ Transaction confirmed: 4yF2...
```

## Advantages of This Approach

1. **TRUE Instant Finality**
   - Client funds move on-chain immediately
   - No IOU/credit system
   - Single atomic transaction

2. **Autonomous**
   - No human intervention needed
   - Agents handle everything
   - Perfect for AI-to-AI commerce

3. **Secure**
   - Nonce system prevents replay attacks
   - Cryptographic signatures
   - On-chain verification

4. **Scalable**
   - Facilitator can handle many providers
   - Providers can use same facilitator
   - Or run their own facilitator

## Next Steps

1. **Implement Facilitator** - Copy logic from x402 Express template
2. **Update Provider Middleware** - Use pattern above
3. **Update Client** - Use `@faremeter/fetch`
4. **Test Locally** - Full payment flow
5. **Deploy** - Real Solana mainnet

## Resources

- **x402 Express Template**: `https://github.com/solana-foundation/templates/tree/main/community/gill-node-solanax402`
- **@faremeter/fetch**: `https://github.com/corbits/faremeter`
- **Solana Web3.js**: `https://solana-labs.github.io/solana-web3.js/`
- **Gill SDK**: `https://github.com/solana-developers/gill`

---

**Status**: Ready to implement
**Estimated Time**: 2-3 hours for full implementation
**Difficulty**: Medium (mostly copying patterns)

Good luck! 🚀
