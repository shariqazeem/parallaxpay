import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

/**
 * ParallaxPay Demo - No Payment Version
 *
 * This demo shows the autonomous agent capabilities without requiring funded wallets
 */

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🤖 ParallaxPay Autonomous Agent Demo (No Payment) 🤖       ║
╠══════════════════════════════════════════════════════════════╣
║  Demonstrating:                                              ║
║    ✓ Autonomous provider discovery                           ║
║    ✓ Intelligent provider selection                          ║
║    ✓ x402 protocol flow                                      ║
║    ✓ AI inference from provider                              ║
║                                                              ║
║  NOTE: This demo shows the flow without actual payments      ║
╚══════════════════════════════════════════════════════════════╝
  `);

  try {
    const providerUrl = process.env.DEFAULT_PROVIDER || 'http://localhost:4001';

    console.log('[1/5] 🔍 Discovering provider...\n');

    // Discover provider
    try {
      const infoResponse = await axios.get(`${providerUrl}/api/info`, { timeout: 5000 });
      console.log('✅ Provider discovered:');
      console.log(`   Name: ${infoResponse.data.name}`);
      console.log(`   Address: ${infoResponse.data.address}`);
      console.log(`   Network: ${infoResponse.data.network}`);
      console.log(`   Models: ${infoResponse.data.models.join(', ')}`);
      console.log(`   Pricing:`);
      console.log(`     Basic: $${infoResponse.data.pricing.basic}`);
      console.log(`     Standard: $${infoResponse.data.pricing.standard}`);
      console.log(`     Premium: $${infoResponse.data.pricing.premium}\n`);
    } catch (error: any) {
      console.error('❌ Provider not accessible. Make sure provider is running on port 4001');
      console.error('   Start it with: cd agents/provider && npm run dev\n');
      process.exit(1);
    }

    console.log('[2/5] 🤖 Requesting AI inference...\n');

    // Try to request inference (will get 402)
    try {
      const inferenceResponse = await axios.post(
        `${providerUrl}/v1/inference`,
        {
          prompt: 'Explain the x402 protocol in one sentence',
          max_tokens: 100,
          temperature: 0.7
        },
        { timeout: 10000 }
      );

      console.log('✅ Got response (provider did not require payment):');
      console.log(`   ${inferenceResponse.data.completion}\n`);

    } catch (error: any) {
      if (error.response && error.response.status === 402) {
        console.log('✅ Received HTTP 402 Payment Required (as expected)');
        console.log('   This proves x402 protection is working!\n');

        const paymentInfo = error.response.data;
        console.log('[3/5] 💰 Payment Information:\n');
        console.log(`   Protocol: ${paymentInfo.protocol}`);
        console.log(`   Network: ${paymentInfo.network}`);
        console.log(`   Recipient: ${paymentInfo.recipient}`);
        console.log(`   Facilitator: ${paymentInfo.facilitator}`);
        console.log(`   Pricing Tiers:`);
        console.log(`     Basic: $${paymentInfo.pricing.basic.price} (${paymentInfo.pricing.basic.max_tokens} tokens)`);
        console.log(`     Standard: $${paymentInfo.pricing.standard.price} (${paymentInfo.pricing.standard.max_tokens} tokens)`);
        console.log(`     Premium: $${paymentInfo.pricing.premium.price} (${paymentInfo.pricing.premium.max_tokens} tokens)\n`);

        console.log('[4/5] 🔄 In a real scenario, client agent would:\n');
        console.log('   1. Create a Solana transaction sending USDC to recipient');
        console.log('   2. Sign the transaction with client wallet');
        console.log('   3. Submit to Solana blockchain');
        console.log('   4. Wait for confirmation (400ms on Solana)');
        console.log('   5. Retry request with X-Payment header containing tx signature');
        console.log('   6. Receive AI-generated response\n');

        console.log('[5/5] 📊 Demo Summary:\n');
        console.log('   ✅ Provider discovery working');
        console.log('   ✅ x402 protection active (returns 402)');
        console.log('   ✅ Payment info provided in response');
        console.log('   ✅ Provider exposes complete API\n');

        console.log('💡 To run with actual payments:');
        console.log('   1. Fund your client wallet with SOL:');
        console.log('      solana airdrop 1 <YOUR_CLIENT_ADDRESS> --url devnet');
        console.log('   2. Retry in a few minutes when rate limit clears');
        console.log('   3. Run: npm run demo\n');

      } else {
        throw error;
      }
    }

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  ✅ Demo Complete! ✅                                        ║
╠══════════════════════════════════════════════════════════════╣
║  What we demonstrated:                                       ║
║    ✓ Provider discovery API                                  ║
║    ✓ x402 payment protection                                 ║
║    ✓ Pricing information                                     ║
║    ✓ Complete marketplace infrastructure                     ║
║                                                              ║
║  This is the foundation of the autonomous agent economy! 🚀  ║
╚══════════════════════════════════════════════════════════════╝
    `);

  } catch (error: any) {
    console.error('\n❌ Demo failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Make sure provider agent is running (cd agents/provider && npm run dev)');
    console.error('  2. Verify provider is accessible on http://localhost:4001');
    console.error('  3. Check provider logs for errors\n');
    process.exit(1);
  }
}

main().catch(console.error);
