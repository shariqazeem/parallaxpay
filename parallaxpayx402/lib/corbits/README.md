# Corbits x402 Integration for Solana

This directory contains the Corbits (@faremeter) integration for automatic x402 payments on Solana.

## What is Corbits?

Corbits is an open-source framework for implementing HTTP 402 "Payment Required" using blockchain micropayments. It makes it easy to:

- 🔄 Automatically handle payment-required API responses
- 💳 Accept/make payments in USDC or other SPL tokens
- 🔒 Keep transactions secure and non-custodial
- ⚡ Enable micropayments for AI APIs, RPC nodes, and data services

## Features

- ✅ Works with Phantom wallet in browser
- ✅ Automatic payment detection and handling
- ✅ USDC payments on Solana devnet/mainnet
- ✅ Simple TypeScript API
- ✅ Compatible with existing Solana Wallet Adapter

## Quick Start

### 1. Install Dependencies

```bash
npm install @faremeter/payment-solana @faremeter/fetch @faremeter/info
```

### 2. Client-Side Usage (Browser with Phantom)

```typescript
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { createPaymentFetch } from '@/lib/corbits';

function MyComponent() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const handlePayment = async () => {
    if (!publicKey || !signTransaction) return;

    // Create Corbits wallet
    const wallet = {
      network: 'devnet',
      publicKey,
      updateTransaction: async (tx) => {
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

    // Make API call - payment happens automatically on 402 response
    const response = await fetchWithPayer('https://api.example.com/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: 'example' }),
    });

    const data = await response.json();
    console.log(data);
  };
}
```

### 3. Server-Side Middleware (Express)

```typescript
import express from 'express';
import { express as middleware } from '@faremeter/middleware';
import { solana } from '@faremeter/info';

const app = express();

// Create payment middleware
const paywalledMiddleware = await middleware.createMiddleware({
  facilitatorURL: 'https://facilitator.corbits.dev',
  accepts: [
    {
      ...solana.x402Exact({
        network: 'devnet',
        asset: 'USDC',
        amount: 10000, // $0.01 in USDC base units
        payTo: 'YOUR_WALLET_ADDRESS',
      }),
      resource: 'https://yourapi.com/api/premium',
      description: 'Premium API access',
    },
  ],
});

// Free endpoint
app.get('/api/free', (req, res) => {
  res.json({ data: 'free content' });
});

// Premium endpoint with payment required
app.get('/api/premium', paywalledMiddleware, (req, res) => {
  res.json({ data: 'premium content' });
});

app.listen(3000);
```

## File Structure

```
lib/corbits/
├── README.md          # This file
├── index.ts           # Main exports
├── wallet.ts          # Phantom wallet integration
└── payment.ts         # Payment handler and utilities
```

## API Reference

### `createPhantomCorbitsWallet(network)`

Creates a Corbits-compatible wallet from Phantom browser extension.

**Parameters:**
- `network`: `'mainnet-beta' | 'devnet' | 'testnet'`

**Returns:** `Promise<CorbitsWallet>`

### `createPaymentFetch(options)`

Creates a fetch function that automatically handles x402 payments.

**Parameters:**
- `wallet`: CorbitsWallet instance
- `connection`: Solana Connection object
- `network`: Network name
- `token`: Token to use for payment (default: 'USDC')

**Returns:** Payment-enabled fetch function

### `makePaymentRequest(options)`

Helper to make a single paid API request.

**Parameters:**
- `wallet`: CorbitsWallet instance
- `connection`: Solana Connection object
- `network`: Network name
- `url`: API endpoint URL
- `method`: HTTP method (default: 'GET')
- `headers`: Request headers
- `body`: Request body
- `token`: Token to use (default: 'USDC')

**Returns:** `Promise<any>` - Response data

## Examples

### Call Helius RPC API

```typescript
import { callHeliusAPI } from '@/lib/corbits';

const data = await callHeliusAPI(
  wallet,
  connection,
  'devnet',
  'getBlockHeight'
);
console.log(data);
```

### Custom API Endpoint

```typescript
import { makePaymentRequest } from '@/lib/corbits';

const result = await makePaymentRequest({
  wallet,
  connection,
  network: 'devnet',
  url: 'https://api.example.com/inference',
  method: 'POST',
  body: {
    prompt: 'Hello, AI!',
    max_tokens: 256,
  },
});
```

## Demo

Visit `/corbits-demo` in the app to see a live demonstration of the payment flow.

## Resources

- [Corbits Documentation](https://corbits.dev/)
- [x402 Protocol Specification](https://www.x402.org/)
- [Faremeter GitHub](https://github.com/faremeter/faremeter)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)

## Troubleshooting

### "Phantom wallet not found"
Make sure you have Phantom wallet extension installed in your browser.

### "Insufficient USDC balance"
Fund your wallet with devnet USDC from a faucet:
- Use Solana's token faucet or request devnet USDC

### "Transaction failed"
- Check that your wallet has enough SOL for transaction fees
- Verify you're on the correct network (devnet/mainnet)
- Ensure the API endpoint supports x402 protocol

## License

This implementation uses MIT-licensed components from the Faremeter project.
