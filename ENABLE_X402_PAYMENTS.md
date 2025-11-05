# How to Test x402 Payments

## Current Status

I've enabled x402 payment verification by setting `DISABLE_X402=false` in your provider configuration. Now you'll see actual payment requests!

## What You'll See With Payments Enabled

### Before (Testing Mode):
- ⚠️ Free access - no payment required
- Immediate AI responses
- No transaction signatures

### After (x402 Enabled):
1. **Payment Required Notice**
   - Browser shows: "💳 Payment required: 0.01 SOL"

2. **Phantom Wallet Popup**
   - Wallet asks you to approve transaction
   - Shows: Transfer 0.01 SOL to provider

3. **Transaction Confirmation**
   - "✅ Payment sent!"
   - Transaction signature displayed
   - Link to Solana Explorer

4. **AI Response**
   - AI inference runs after payment confirmed
   - Response includes payment proof

## Testing the Full Payment Flow

### Step 1: Ensure You Have SOL on Devnet
```bash
# Check your balance
solana balance <YOUR_WALLET_ADDRESS> --url devnet

# If you need SOL, airdrop some (devnet only)
solana airdrop 1 <YOUR_WALLET_ADDRESS> --url devnet
```

### Step 2: Open the App
Go to: http://localhost:3000/content/basic

### Step 3: Connect Wallet
1. Click "Connect Wallet"
2. Approve Phantom connection
3. Make sure you're on **Devnet** in Phantom settings

### Step 4: Generate with Payment
1. Enter a prompt: "What is blockchain?"
2. Click "✨ Generate AI Response"
3. **Look for**:
   - 💳 Payment required notification
   - Phantom popup asking for approval
   - Transaction signature in the UI

### Step 5: Verify Payment
After the transaction, you'll see:
```
💳 Payment Processed:
Amount: 0.01 SOL
Transaction: https://explorer.solana.com/tx/<signature>?cluster=devnet
```

## What the Browser Does (Automatic x402)

The client library handles everything automatically:

```typescript
// In your browser (lib/x402/fetch.ts)
const fetchWithPayment = createX402Fetch({
  wallet,
  connection,
  onPaymentRequired: (amount) => {
    // Shows: "💳 Payment required: 0.01 SOL"
  },
  onPaymentCreated: (txSignature) => {
    // Shows: "✅ Payment sent!"
    // Displays transaction link
  }
});

// When you click Generate:
// 1. First request → 402 Payment Required
// 2. Client automatically creates payment
// 3. Phantom shows approval dialog
// 4. You approve → transaction signed
// 5. Second request (with payment) → 200 OK + AI response
```

## Payment Flow Diagram

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │ 1. POST /v1/inference (no payment)
       ▼
┌──────────────┐
│   Provider   │ ← DISABLE_X402=false (now enabled!)
└──────┬───────┘
       │ 2. Returns 402 Payment Required
       │    {amount: "10000000", recipient: "9qzm..."}
       ▼
┌──────────────┐
│   Browser    │ ← Catches 402, creates payment
└──────┬───────┘
       │ 3. Signs transaction with Phantom
       │ 4. POST /v1/inference (with X-Payment header)
       ▼
┌──────────────┐
│   Provider   │ ← x402Middleware extracts payment
└──────┬───────┘
       │ 5. POST /verify to facilitator
       ▼
┌──────────────┐
│ Facilitator  │ ← Verifies signature, checks nonce
└──────┬───────┘
       │ 6. Returns {verified: true}
       ▼
┌──────────────┐
│   Provider   │ ← POST /settle to facilitator
└──────┬───────┘
       │ 7. Facilitator broadcasts to Solana
       ▼
┌──────────────┐
│   Solana     │ ← Transaction confirmed on-chain
└──────┬───────┘
       │ 8. Returns transaction signature
       ▼
┌──────────────┐
│   Provider   │ ← Processes AI inference
└──────┬───────┘
       │ 9. Returns AI response + payment proof
       ▼
┌──────────────┐
│   Browser    │ ← Shows response + transaction link
└──────────────┘
```

## Monitoring Payments

### Provider Logs
```bash
tail -f /tmp/provider.log
```

Look for:
```
🔍 Verifying payment with facilitator...
💰 Settling payment with facilitator...
✅ Payment settled: <transaction_signature>
🤖 Processing basic inference request...
```

### Facilitator Logs
```bash
tail -f /tmp/facilitator.log
```

Look for:
```
POST /verify
Signature valid? true
Nonce stored and marked as used
POST /settle
Transaction broadcast successful
```

### Solana Explorer
Click the transaction link in the UI or go to:
```
https://explorer.solana.com/tx/<YOUR_TX_SIGNATURE>?cluster=devnet
```

You'll see:
- From: Your wallet address
- To: Provider wallet (9qzmG8vPymc2CAMchZgq26qiUFq4pEfTx6HZfpMhh51y)
- Amount: 0.01 SOL (10,000,000 lamports)
- Status: ✅ Confirmed

## Troubleshooting

### "Insufficient SOL" Error
```bash
solana airdrop 1 <YOUR_WALLET_ADDRESS> --url devnet
```

### No Phantom Popup
- Check if Phantom is unlocked
- Verify you're on Devnet network in Phantom
- Check browser console for errors

### Payment Verification Failed
```bash
# Check facilitator is running
curl http://localhost:3002/health

# Check facilitator logs
tail -f /tmp/facilitator.log
```

### Transaction Not Found on Explorer
- Wait a few seconds for confirmation
- Check you're viewing Devnet (not Mainnet)
- Verify the transaction signature is correct

## Expected Costs

| Tier     | Price     | Tokens | Model        |
|----------|-----------|--------|--------------|
| Basic    | 0.01 SOL  | 100    | Qwen 0.6B    |
| Standard | 0.05 SOL  | 256    | Qwen 7B      |
| Premium  | 0.25 SOL  | 512    | Qwen 72B     |

## Testing Tips

1. **Start with small amounts**: Basic tier is only 0.01 SOL (~$0.001)
2. **Check both sides**: Monitor both provider and facilitator logs
3. **Watch Phantom**: The popup is your visual confirmation
4. **Verify on-chain**: Always check Solana Explorer for final confirmation
5. **Track your balance**: Note your starting SOL and watch it decrease

## Success Criteria

You know x402 is working when you see ALL of these:

✅ Browser shows "💳 Payment required"
✅ Phantom wallet popup appears
✅ You approve the transaction
✅ Transaction signature displayed in UI
✅ AI response generated after payment
✅ Transaction visible on Solana Explorer
✅ Provider wallet balance increased
✅ Your wallet balance decreased

## Reverting to Testing Mode

If you want to disable payments again:

```bash
# Edit agents/provider/.env
DISABLE_X402=true

# Restart provider
cd agents/provider
npm run dev
```

---

**Ready to test!** Open http://localhost:3000/content/basic and try generating content. You should now see the full x402 payment flow! 🚀
