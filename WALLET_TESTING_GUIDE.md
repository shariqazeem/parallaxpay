# Wallet Integration Testing Guide

The frontend now has **Solana Wallet Adapter** integrated! Users can connect their wallets (Phantom, Solflare) and make automatic payments when requesting AI inference.

## 🎉 What's New

### Features Added
1. **Wallet Connection UI** - Connect Phantom or Solflare wallet
2. **Automatic Payments** - When you click "Generate Response", it automatically:
   - Makes a payment to the provider (0.001 SOL)
   - Sends the transaction signature to prove payment
   - Gets your AI response
3. **Payment Status Tracking** - See all your transactions in the history panel

## 🚀 How to Test End-to-End

### Step 1: Start the Provider Agent

First terminal:
```bash
cd agents/provider
npm install
npm start
```

This starts the provider agent on `http://localhost:4001` that will:
- Accept AI inference requests
- Require x402 payments
- Return AI responses after payment verification

### Step 2: Start the Frontend

Second terminal:
```bash
cd parallaxpayx402
npm run dev
```

Frontend will be available at `http://localhost:3000`

### Step 3: Set Up Your Wallet

1. Install **Phantom Wallet** browser extension if you don't have it
2. Switch to **Devnet** in Phantom settings
3. Get some devnet SOL:
   - Copy your wallet address
   - Go to https://faucet.solana.com
   - Paste address and request airdrop
   - Wait for confirmation

### Step 4: Use the Marketplace

1. Open `http://localhost:3000/marketplace`
2. You should see your local provider in the list
3. Click **"Connect Wallet"** button in the top right
4. Select your wallet (Phantom/Solflare) and approve connection

### Step 5: Test AI Inference with Payment

1. Select a provider from the left sidebar
2. Choose a pricing tier (Basic/Standard/Premium)
3. Enter a prompt like: "Explain how Solana achieves sub-second finality"
4. Click **"Generate Response"**

**What happens:**
- Frontend makes initial request to provider
- Provider returns 402 Payment Required
- Frontend automatically creates a Solana transaction for 0.001 SOL
- Phantom wallet pops up asking you to approve
- Click **Approve** in Phantom
- Frontend waits for confirmation
- Frontend retries request with payment signature
- Provider verifies payment on-chain
- You get your AI response!

### Step 6: Check Transaction History

- Look at the "Transaction History" panel on the right
- You should see:
  - ✓ success status
  - Provider name
  - Tier used
  - Cost ($0.01 / $0.05 / $0.25)
  - Timestamp

## 🔍 How It Works

### Payment Flow

```
User enters prompt → Click Generate
         ↓
Frontend makes request to provider
         ↓
Provider returns 402 Payment Required
         ↓
Frontend creates SOL transfer transaction
         ↓
User approves in Phantom wallet
         ↓
Transaction sent to Solana devnet
         ↓
Frontend waits for confirmation
         ↓
Frontend retries with transaction signature
         ↓
Provider verifies payment on-chain
         ↓
Provider returns AI response
         ↓
Frontend shows result ✓
```

### Code Changes Made

1. **parallaxpayx402/package.json**
   - Added @solana/wallet-adapter-react
   - Added @solana/wallet-adapter-react-ui
   - Added @solana/wallet-adapter-wallets
   - Added @solana/wallet-adapter-base

2. **parallaxpayx402/components/wallet-provider.tsx** (NEW)
   - Wraps app with wallet context
   - Configures Phantom and Solflare adapters
   - Connects to Solana devnet

3. **parallaxpayx402/app/layout.tsx**
   - Wraps app with WalletContextProvider

4. **parallaxpayx402/components/inference-panel.tsx**
   - Added wallet connection UI
   - Added automatic payment handling
   - Shows warning if wallet not connected
   - Handles 402 response by making payment
   - Retries request with payment signature

## 🐛 Troubleshooting

### "Wallet not connected" error
- Click the "Connect Wallet" button in the UI
- Approve connection in Phantom

### "Insufficient funds" error
- You need devnet SOL
- Use faucet: https://faucet.solana.com
- Need at least 0.001 SOL + gas fees

### Provider not showing up
- Make sure provider agent is running on port 4001
- Check `npm start` in agents/provider directory
- Provider advertises itself at http://localhost:4001/api/discovery

### Payment signature not accepted
- Provider needs to verify the signature
- Make sure the transaction actually confirmed on-chain
- Check your wallet for the transaction

### Phantom wallet not appearing
- Install Phantom browser extension
- Make sure you're on a supported browser (Chrome, Brave, Edge)
- Refresh the page after installing

## 🎯 Testing Checklist

- [ ] Provider agent running on port 4001
- [ ] Frontend running on port 3000
- [ ] Phantom wallet installed and on devnet
- [ ] Wallet has at least 0.01 SOL
- [ ] Wallet connected to frontend
- [ ] Can select provider and tier
- [ ] Can enter prompt
- [ ] Click generate triggers Phantom approval
- [ ] Approve transaction in Phantom
- [ ] See "Generating..." loading state
- [ ] Get AI response after payment
- [ ] Transaction appears in history as "success"
- [ ] Wallet balance decreased by 0.001 SOL

## 📊 What to Submit for Hackathon

Your working marketplace demonstrates:

### X402 Protocol Track
✅ HTTP 402 Payment Required responses
✅ Pay-per-request micropayments
✅ Automatic payment handling
✅ Sub-second finality via Solana

### Parallax Eco Track
✅ Integration with Gradient Parallax inference
✅ Distributed AI compute marketplace
✅ Provider discovery system

### Trustless Agent Track
✅ On-chain payment verification
✅ No trusted intermediaries
✅ Transparent transaction history
✅ Autonomous client agents (npm run demo)

### X402 API Track
✅ X402 middleware implementation
✅ Payment verification system
✅ Tiered pricing structure
✅ Real-time payment processing

## 🎬 Next Steps

1. Test the complete flow locally
2. Record a demo video showing:
   - Wallet connection
   - AI inference request
   - Payment approval in Phantom
   - Successful response
   - Transaction history
3. Take screenshots for your submission
4. Deploy if needed for the hackathon

## 💡 Tips

- Start with "Basic" tier ($0.01) for testing
- Each request costs 0.001 SOL on devnet (fixed for demo)
- You can make multiple requests - wallet will prompt each time
- Transaction history persists in your browser session
- Provider wallet receives all payments

Congratulations! You now have a fully working decentralized AI marketplace with Solana payments! 🎉
