import { ParallaxPayClientAgent } from './index';
import dotenv from 'dotenv';

dotenv.config();

/**
 * ParallaxPay Autonomous Agent Demo
 *
 * This demo showcases:
 * 1. Provider discovery
 * 2. Autonomous provider selection
 * 3. Automatic payment handling
 * 4. AI inference requests
 */

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🤖 ParallaxPay Autonomous Agent Demo 🤖                    ║
╠══════════════════════════════════════════════════════════════╣
║  Demonstrating:                                              ║
║    ✓ Autonomous provider discovery                           ║
║    ✓ Intelligent provider selection                          ║
║    ✓ Automatic x402 payments on Solana                       ║
║    ✓ AI inference from distributed Parallax network          ║
╚══════════════════════════════════════════════════════════════╝
  `);

  try {
    // Initialize agent
    console.log('\n[1/6] 🚀 Initializing autonomous agent...');
    const agent = new ParallaxPayClientAgent();

    const balance = await agent.getBalance();
    console.log(`✅ Agent wallet ready`);
    console.log(`💰 Balance: ${balance.toFixed(4)} SOL`);

    const budget = agent.getBudgetStatus();
    console.log(`📊 Budget: $${budget.remaining.toFixed(2)} / $${budget.dailyLimit} remaining\n`);

    // Discover providers
    console.log('[2/6] 🔍 Discovering available AI providers...');
    const providers = await agent.discoverProviders();

    if (providers.length > 0) {
      console.log(`✅ Found ${providers.length} provider(s):\n`);
      providers.forEach((p, i) => {
        console.log(`   Provider ${i + 1}:`);
        console.log(`     Name: ${p.provider?.name || 'Unknown'}`);
        console.log(`     Region: ${p.provider?.region || 'Unknown'}`);
        console.log(`     Rating: ${p.reputation?.rating || 5.0}⭐`);
        console.log(`     Basic: $${p.pricing?.tiers?.basic?.price_usd || 0.01}`);
        console.log(`     Standard: $${p.pricing?.tiers?.standard?.price_usd || 0.05}`);
        console.log(`     Premium: $${p.pricing?.tiers?.premium?.price_usd || 0.25}\n`);
      });
    } else {
      console.log('⚠️ No providers discovered, using default provider\n');
    }

    // Select provider
    console.log('[3/6] 🎯 Selecting optimal provider...');
    if (providers.length > 0) {
      const selected = await agent.selectProvider(providers, 'basic');
      console.log(`✅ Selected: ${selected.provider?.name || 'Provider'}`);
      console.log(`   Reason: Best price/performance ratio\n`);
    } else {
      console.log(`✅ Using default provider\n`);
    }

    // Test inference requests
    console.log('[4/6] 🤖 Running inference tests...\n');

    // Test 1: Basic tier
    console.log('─── Test 1: Basic Tier ($0.01) ───');
    const result1 = await agent.requestInference(
      'Explain Solana blockchain in one sentence',
      'basic'
    );
    console.log(`📄 Response: ${result1.completion}\n`);

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Standard tier
    console.log('─── Test 2: Standard Tier ($0.05) ───');
    const result2 = await agent.requestInference(
      'What is the x402 protocol?',
      'standard'
    );
    console.log(`📄 Response: ${result2.completion}\n`);

    // Show budget status
    console.log('[5/6] 💰 Budget Status:');
    const finalBudget = agent.getBudgetStatus();
    console.log(`   Spent: $${finalBudget.spent.toFixed(2)}`);
    console.log(`   Remaining: $${finalBudget.remaining.toFixed(2)}`);
    console.log(`   Used: ${finalBudget.percentUsed.toFixed(1)}%\n`);

    // Summary
    console.log('[6/6] ✅ Demo Complete!\n');
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🎉 Autonomous Agent Demo Successful! 🎉                     ║
╠══════════════════════════════════════════════════════════════╣
║  Demonstrated Capabilities:                                  ║
║    ✓ Discovered ${providers.length} AI provider(s)                               ║
║    ✓ Autonomously selected best provider                     ║
║    ✓ Executed 2 paid AI inference requests                   ║
║    ✓ Processed payments via x402 on Solana                   ║
║    ✓ Managed budget automatically                            ║
║                                                              ║
║  This is the future of AI agent commerce! 🚀                 ║
╚══════════════════════════════════════════════════════════════╝
    `);

  } catch (error: any) {
    console.error('\n❌ Demo failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Make sure provider agent is running (npm run provider:dev)');
    console.error('  2. Check your wallet has SOL balance');
    console.error('  3. Verify environment variables are set');
    console.error('  4. Ensure you\'re on devnet');
    process.exit(1);
  }
}

// Run demo
main().catch(console.error);
