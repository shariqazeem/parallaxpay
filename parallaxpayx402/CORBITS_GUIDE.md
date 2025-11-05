# Corbits x402 Implementation Guide

This guide explains how to use the Corbits x402 implementation in the ParallaxPay Next.js application.

## What Changed?

We replaced the broken `x402-next` package with **Corbits** (@faremeter packages), which provides:

- ✅ Stable, production-ready x402 implementation
- ✅ Better Solana integration
- ✅ More flexible payment handling
- ✅ Active development and community support

## Quick Start

### 1. Demo the Implementation

Visit the demo page:
```
http://localhost:3000/corbits-demo
```

This shows a complete working example of:
- Connecting Phantom wallet
- Making a paid API call to Helius RPC
- Automatic payment handling with Corbits

### 2. Test Your Own Protected API

We've created a protected API endpoint at `/api/corbits-protected` that you can test with Corbits.

## Client-Side Usage

### Basic Example

```typescript
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { createPaymentFetch } from '@/lib/corbits';
import { VersionedTransaction } from '@solana/web3.js';

function MyComponent() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const makePayment = async () => {
    if (!publicKey || !signTransaction) return;

    // Create Corbits wallet
    const wallet = {
      network: 'devnet',
      publicKey,
      updateTransaction: async (tx: VersionedTransaction) => {
        return await signTransaction(tx);
      },
    };

    // Create payment-enabled fetch
    const fetchWithPayer = createPaymentFetch({
      wallet,
      connection,
      network: 'devnet',
      token: 'USDC',
    });

    // Make paid API call
    const response = await fetchWithPayer('https://api.example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: 'example' }),
    });

    return response.json();
  };
}
```

### Using the Helper Function

```typescript
import { makePaymentRequest } from '@/lib/corbits';

const result = await makePaymentRequest({
  wallet,
  connection,
  network: 'devnet',
  url: 'https://api.example.com/endpoint',
  method: 'POST',
  body: { prompt: 'Hello AI!' },
  token: 'USDC',
});
```

## Server-Side Usage

### Option 1: Next.js API Route (Current Implementation)

See `/app/api/corbits-protected/route.ts` for an example of manually implementing x402 in a Next.js API route.

### Option 2: Express Server (Recommended for Production)

If you need a standalone API server, use Corbits middleware with Express:

```typescript
import express from 'express';
import { express as middleware } from '@faremeter/middleware';
import { solana } from '@faremeter/info';

const app = express();

const paywalledMiddleware = await middleware.createMiddleware({
  facilitatorURL: 'https://facilitator.corbits.dev',
  accepts: [
    {
      ...solana.x402Exact({
        network: 'devnet',
        asset: 'USDC',
        amount: 10000, // $0.01 in USDC
        payTo: 'YOUR_WALLET_ADDRESS',
      }),
      resource: 'https://yourapi.com/api/premium',
      description: 'Premium API access',
    },
  ],
});

// Protected endpoint
app.get('/api/premium', paywalledMiddleware, (req, res) => {
  res.json({ data: 'premium content' });
});

app.listen(3000);
```

## File Structure

```
parallaxpayx402/
├── lib/corbits/              # Corbits integration
│   ├── wallet.ts            # Phantom wallet adapter
│   ├── payment.ts           # Payment handler utilities
│   ├── index.ts             # Main exports
│   └── README.md            # Detailed API docs
├── app/
│   ├── corbits-demo/        # Live demo page
│   │   └── page.tsx
│   └── api/
│       └── corbits-protected/ # Protected API example
│           └── route.ts
└── CORBITS_GUIDE.md         # This file
```

## Payment Flow

### How x402 Works with Corbits

1. **Client makes request** to protected API
   ```
   GET /api/premium
   ```

2. **Server responds with 402** Payment Required
   ```json
   {
     "amount": "10000",
     "recipient": "WALLET_ADDRESS",
     "network": "solana-devnet",
     "token": "USDC"
   }
   ```

3. **Corbits handles payment automatically**
   - Creates USDC transfer transaction
   - Prompts user to sign in Phantom
   - Submits transaction to network

4. **Client retries with payment proof**
   ```
   GET /api/premium
   Headers:
     X-Payment: <base64 encoded payment data>
   ```

5. **Server verifies and returns content**
   ```json
   {
     "data": "premium content"
   }
   ```

## Network Configuration

### Devnet (Testing)

```typescript
const wallet = {
  network: 'devnet',
  // ...
};

const fetchWithPayer = createPaymentFetch({
  wallet,
  connection: new Connection('https://api.devnet.solana.com'),
  network: 'devnet',
  token: 'USDC',
});
```

**Getting Devnet USDC:**
1. Get devnet SOL from [Solana Faucet](https://faucet.solana.com/)
2. Request devnet USDC (you may need to find a devnet USDC faucet)

### Mainnet (Production)

```typescript
const wallet = {
  network: 'mainnet-beta',
  // ...
};

const fetchWithPayer = createPaymentFetch({
  wallet,
  connection: new Connection('https://api.mainnet-beta.solana.com'),
  network: 'mainnet-beta',
  token: 'USDC',
});
```

## Common Issues

### "Phantom wallet not found"
- Install [Phantom wallet extension](https://phantom.app/)
- Refresh the page after installation

### "Insufficient USDC balance"
- For devnet: Get devnet USDC from a faucet
- For mainnet: Buy USDC on an exchange and send to your wallet

### "Transaction failed"
- Check SOL balance for transaction fees (~0.000005 SOL)
- Verify correct network (devnet vs mainnet)
- Check RPC endpoint is responding

### "Payment verification failed"
- Check that the payment amount matches server requirements
- Verify wallet address is correct
- Ensure transaction is confirmed on-chain

## Integrating with InferencePanel

To update the existing InferencePanel component to use Corbits:

```typescript
// In inference-panel.tsx
import { createPaymentFetch } from '@/lib/corbits';

// Inside component:
const handleGenerate = async () => {
  if (!publicKey || !signTransaction) return;

  // Create Corbits wallet
  const wallet = {
    network: 'devnet',
    publicKey,
    updateTransaction: async (tx) => signTransaction(tx),
  };

  // Create payment-enabled fetch
  const fetchWithPayer = createPaymentFetch({
    wallet,
    connection,
    network: 'devnet',
    token: 'USDC',
  });

  // Make paid API call - payment happens automatically!
  const response = await fetchWithPayer(`${provider.url}/v1/inference`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      max_tokens: tierConfig[selectedTier],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  setResult(data);
};
```

## Production Checklist

Before deploying to production:

- [ ] Switch from devnet to mainnet
- [ ] Update RPC endpoints to reliable providers (Helius, Quicknode, etc.)
- [ ] Implement proper payment verification on server
- [ ] Add transaction logging and monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Test with real USDC on mainnet
- [ ] Implement retry logic for failed transactions
- [ ] Add rate limiting to prevent abuse
- [ ] Store transaction hashes to prevent replay attacks
- [ ] Set up wallet monitoring for received payments

## Resources

- [Corbits Documentation](https://corbits.dev/)
- [x402 Protocol](https://www.x402.org/)
- [Faremeter GitHub](https://github.com/faremeter/faremeter)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Phantom Wallet](https://phantom.app/)

## Support

- Corbits Community: [Telegram](https://t.me/+0VGMeJWdkVZiYmEx)
- x402 Spec: [x402.org](https://www.x402.org/)
- Solana Discord: [Solana Discord](https://discord.gg/solana)

## License

This implementation uses MIT-licensed Corbits/Faremeter packages.
