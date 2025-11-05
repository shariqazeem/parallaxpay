# X402 Next.js Solana Template with Corbits

**A Next.js starter template with X402 payment protocol integration for Solana using Corbits.**

This template demonstrates a streamlined implementation of the X402 payment protocol using **Corbits** (@faremeter packages), making it easy to add cryptocurrency micropayments to your Next.js applications.

> ✨ **New**: We've upgraded from `x402-next` to **Corbits** for better stability, more features, and active development.

> ⚠️ **Using on Mainnet?** This template is configured for testnet (devnet) by default. To accept real payments on mainnet, see the [Corbits Guide](CORBITS_GUIDE.md) for setup instructions.

## Table of Contents

- [What is X402?](#what-is-x402)
- [What is Corbits?](#what-is-corbits)
- [Features](#features)
- [Getting Started](#getting-started)
- [Quick Demo](#quick-demo)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Usage](#usage)

---

## What is X402?

**X402** is an open payment protocol that uses HTTP status code **402 "Payment Required"** to enable seamless cryptocurrency payments for web content and APIs.

### Key Benefits

- **Direct Payments** - Accept cryptocurrency payments without third-party payment processors
- **No Accounts** - No user registration or authentication required
- **Blockchain-Verified** - Payments are verified directly on the Solana blockchain
- **Simple Integration** - Add payment gates to any Next.js route with middleware
- **Flexible Pricing** - Set different prices for different content

### How It Works

```
1. User requests protected content
2. Server responds with 402 Payment Required
3. User makes payment via Coinbase Pay or crypto wallet
4. User proves payment with transaction signature
5. Server verifies on blockchain and grants access
```

---

## What is Corbits?

**Corbits** is an open-source framework for implementing HTTP 402 "Payment Required" using blockchain micropayments on Solana. Built by the Faremeter team, it provides:

### Why Corbits?

- **✅ Stable** - Production-ready implementation with active development
- **⚡ Automatic** - Detects 402 responses and handles payment automatically
- **🔒 Secure** - Non-custodial, you control your keys
- **💰 Micropayments** - Perfect for AI APIs, RPC access, and data services
- **🔧 Flexible** - Works with any wallet (Phantom, Solflare, etc.)

### Corbits vs x402-next

We've migrated from `x402-next` to Corbits because:

- ✅ More stable (no BigNumber errors)
- ✅ Better Solana integration
- ✅ Active community and support
- ✅ More flexible architecture
- ✅ Works with any wallet provider

**Learn more**: See [CORBITS_GUIDE.md](CORBITS_GUIDE.md) for detailed documentation.

---

## Features

- **X402 Payment Protocol** - Powered by Corbits (@faremeter packages)
- **Solana Integration** - Uses Solana blockchain with USDC for payment verification
- **Automatic Payment Handling** - Detects 402 responses and pays automatically
- **Multiple Wallet Support** - Works with Phantom, Solflare, and other Solana wallets
- **Type-Safe** - Full TypeScript support
- **Next.js 15** - Built on the latest Next.js App Router
- **Live Demo** - Interactive demo page at `/corbits-demo`

---

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- pnpm, npm, or yarn
- A Solana wallet address to receive payments

### Installation

```bash
# Clone or create from template
npx create-solana-dapp my-app --template x402-template

# Navigate to project
cd my-app

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Visit `http://localhost:3000` to see your app running.

---

## Quick Demo

### Try the Corbits Demo

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000/corbits-demo`
3. Connect your Phantom wallet (make sure you're on Solana devnet)
4. Click "Make Paid API Call"
5. Sign the transaction in Phantom
6. See the API response after payment is verified

### What's Happening?

- The demo calls Helius RPC API via Corbits
- API returns 402 Payment Required
- Corbits automatically creates a USDC payment transaction
- You sign it in Phantom wallet
- API verifies payment and returns data

**That's it!** No manual payment handling, no complex flows - just automatic micropayments.

---

## How It Works

This template uses **Corbits** (@faremeter packages) which provides automatic payment handling for x402 protocol.

### Client-Side Integration

The core of the payment integration is in `lib/corbits/`:

**Example: Making a paid API call**

```typescript
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { createPaymentFetch } from '@/lib/corbits';

function MyComponent() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const makePayment = async () => {
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
    const response = await fetchWithPayer('https://api.example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: 'example' }),
    });

    return response.json();
  };
}
```

### What Happens Under the Hood

1. **API Request** - Your app makes a request to a protected API endpoint
2. **402 Response** - API returns 402 Payment Required with payment details
3. **Automatic Detection** - Corbits detects the 402 response
4. **Transaction Creation** - Corbits creates a USDC transfer transaction
5. **Wallet Signature** - User signs the transaction in Phantom wallet
6. **Transaction Submission** - Corbits submits the transaction to Solana
7. **Payment Verification** - API verifies the payment on-chain
8. **Access Granted** - API returns the protected content

All of this happens **automatically** - you just make a normal fetch request!

---

## Project Structure

```
parallaxpayx402/
├── lib/
│   ├── corbits/              # 🔒 Corbits x402 integration
│   │   ├── wallet.ts        # Phantom wallet adapter
│   │   ├── payment.ts       # Payment handler utilities
│   │   ├── index.ts         # Main exports
│   │   └── README.md        # Detailed API docs
│   └── x402/                # 📦 Legacy x402-next implementation
├── app/
│   ├── page.tsx             # 🏠 Homepage
│   ├── corbits-demo/        # ✨ Interactive Corbits demo
│   │   └── page.tsx
│   ├── marketplace/         # 🛒 AI provider marketplace
│   │   └── page.tsx
│   ├── content/             # 📄 Protected content pages
│   │   └── [type]/page.tsx
│   └── api/
│       ├── corbits-protected/ # 🔐 Protected API example
│       │   └── route.ts
│       └── x402/            # Session management
│           └── session-token/route.ts
├── components/              # ⚛️ React components
│   ├── wallet-provider.tsx  # Solana wallet setup
│   └── inference-panel.tsx  # AI inference UI
├── middleware.ts            # ⚠️ Disabled (x402-next had issues)
├── CORBITS_GUIDE.md        # 📖 Complete Corbits documentation
└── package.json            # 📦 Dependencies
```

---

## Configuration

### Environment Variables

The template uses sensible defaults, but you can customize by creating a `.env.local` file:

```bash
# Your Solana wallet address (where payments go)
NEXT_PUBLIC_WALLET_ADDRESS=your_solana_address_here

# Network (solana-devnet or solana-mainnet-beta)
NEXT_PUBLIC_NETWORK=solana-devnet

# Coinbase Pay Client Key (get from Coinbase Developer Portal)
NEXT_PUBLIC_CDP_CLIENT_KEY=your_client_key_here

# Facilitator URL (service that verifies payments)
NEXT_PUBLIC_FACILITATOR_URL=https://x402.org/facilitator
```

### Customizing Routes and Prices

Edit `middleware.ts` to add or modify protected routes:

```typescript
const x402PaymentMiddleware = paymentMiddleware(
  address,
  {
    '/premium': {
      price: '$1.00',
      config: {
        description: 'Premium content access',
      },
      network: 'solana-mainnet-beta',
    },
    '/api/data': {
      price: '$0.05',
      config: {
        description: 'API data access',
      },
      network: 'solana-mainnet-beta',
    },
  },
  // ... rest of config
)
```

### Network Selection

You can use different networks:

- `solana-devnet` - For testing (use test tokens)
- `solana-mainnet-beta` - For production (real money!)
- `solana-testnet` - Alternative test network

---

## Usage

### Creating Protected Content

Simply create pages under protected routes defined in your middleware:

```tsx
// app/content/premium/page.tsx
export default async function PremiumPage() {
  return (
    <div>
      <h1>Premium Content</h1>
      <p>This content requires payment to access.</p>
      {/* Your protected content here */}
    </div>
  )
}
```

### Adding New Price Tiers

1. Add the route configuration in `middleware.ts`
2. Create the corresponding page component
3. Users will automatically be prompted to pay when accessing the route

### Testing with Devnet

When using `solana-devnet`:

- Payments use test tokens (no real money)
- Perfect for development and testing
- Get test tokens from [Solana Faucet](https://faucet.solana.com/)

### Going to Production

To accept real payments:

1. Change network to `solana-mainnet-beta` in `middleware.ts`
2. Update your wallet address to your production wallet
3. Test thoroughly before deploying!
4. Consider implementing additional security measures

---

## Dependencies

This template uses minimal dependencies:

```json
{
  "dependencies": {
    "next": "16.0.0",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "viem": "^2.38.5",
    "x402-next": "^0.7.1"
  }
}
```

- **next** - Next.js framework
- **react** / **react-dom** - React library
- **viem** - Type-safe Ethereum/Solana types
- **x402-next** - X402 payment middleware (handles all payment logic)

---

## Learn More

### Corbits & x402

- [CORBITS_GUIDE.md](CORBITS_GUIDE.md) - Complete guide to using Corbits in this project
- [Corbits Documentation](https://corbits.dev/) - Official Corbits docs
- [X402 Specification](https://github.com/coinbase/x402) - Official x402 protocol documentation
- [Faremeter GitHub](https://github.com/faremeter/faremeter) - Corbits open-source framework
- [x402.org](https://www.x402.org/) - Protocol website with examples

### Solana

- [Solana Documentation](https://docs.solana.com/) - Official Solana docs
- [Solana Explorer](https://explorer.solana.com/) - View transactions on-chain
- [Phantom Wallet](https://phantom.app/) - Popular Solana wallet

### Community

- [Corbits Telegram](https://t.me/+0VGMeJWdkVZiYmEx) - Get help and support
- [Solana Discord](https://discord.gg/solana) - Solana community

---

## Troubleshooting

### Payment Not Working

1. Check that your wallet address in `middleware.ts` is correct
2. Verify you're using the correct network (devnet vs mainnet)
3. Check browser console for errors
4. Ensure Coinbase Pay client key is valid

### 402 Errors Not Displaying

1. Check middleware matcher configuration in `middleware.ts`
2. Verify route paths match your page structure
3. Clear Next.js cache: `rm -rf .next && pnpm dev`

### Session Not Persisting

1. Check that cookies are enabled in your browser
2. Verify session token endpoint is configured
3. Check for CORS issues if using custom domains

---

## Support

For issues specific to this template, please open an issue on the repository.

For X402 protocol questions, refer to the [official documentation](https://github.com/coinbase/x402).

---

## License

MIT License - Feel free to use this template for your projects.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ from [Kronos](https://www.kronos.build/)**
