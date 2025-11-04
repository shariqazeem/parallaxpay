import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';
import { ProviderDiscovery } from './services/discovery';
import { PaymentService } from './services/payment';
import { InferenceClient } from './services/inference';

dotenv.config();

export class ParallaxPayClientAgent {
  private connection: Connection;
  private wallet: Keypair;
  private discovery: ProviderDiscovery;
  private payment: PaymentService;
  private inference: InferenceClient;
  private budget: {
    maxPerRequest: number;
    dailyLimit: number;
    spent: number;
  };

  constructor() {
    // Initialize Solana connection
    const network = process.env.NETWORK || 'devnet';
    this.connection = new Connection(
      network === 'mainnet-beta'
        ? 'https://api.mainnet-beta.solana.com'
        : 'https://api.devnet.solana.com',
      'confirmed'
    );

    // Load wallet
    try {
      const privateKeyString = process.env.CLIENT_WALLET_PRIVATE_KEY;
      if (!privateKeyString) {
        throw new Error('CLIENT_WALLET_PRIVATE_KEY not set');
      }
      const privateKey = bs58.decode(privateKeyString);
      this.wallet = Keypair.fromSecretKey(privateKey);
      console.log(`✅ Client wallet loaded: ${this.wallet.publicKey.toBase58()}`);
    } catch (error) {
      console.error('❌ Failed to load client wallet:', error);
      throw error;
    }

    // Initialize services
    this.discovery = new ProviderDiscovery();
    this.payment = new PaymentService(this.connection, this.wallet);
    this.inference = new InferenceClient(this.payment);

    // Set budget limits
    this.budget = {
      maxPerRequest: parseFloat(process.env.MAX_PRICE_PER_REQUEST || '0.50'),
      dailyLimit: parseFloat(process.env.DAILY_BUDGET || '5.00'),
      spent: 0
    };
  }

  /**
   * Discover available providers
   */
  async discoverProviders(): Promise<any[]> {
    console.log('🔍 Discovering providers...');
    const providers = await this.discovery.findProviders();
    console.log(`✅ Found ${providers.length} providers`);
    return providers;
  }

  /**
   * Select best provider based on criteria
   */
  async selectProvider(providers: any[], tier: string = 'basic'): Promise<any> {
    const autoSelect = process.env.AUTO_SELECT_CHEAPEST === 'true';
    const minRating = parseFloat(process.env.MIN_PROVIDER_RATING || '3.0');

    // Filter by rating
    const qualified = providers.filter(p =>
      p.reputation?.rating >= minRating
    );

    if (qualified.length === 0) {
      throw new Error('No qualified providers found');
    }

    if (autoSelect) {
      // Select cheapest provider
      qualified.sort((a, b) => {
        const priceA = a.pricing?.tiers?.[tier]?.price_usd || Infinity;
        const priceB = b.pricing?.tiers?.[tier]?.price_usd || Infinity;
        return priceA - priceB;
      });
    }

    return qualified[0];
  }

  /**
   * Request inference from a provider
   */
  async requestInference(
    prompt: string,
    tier: string = 'basic',
    providerUrl?: string
  ): Promise<any> {
    console.log(`\n🤖 Requesting ${tier} inference...`);
    console.log(`📝 Prompt: ${prompt.slice(0, 50)}...`);

    // Check budget
    const tierPrices = {
      basic: 0.01,
      standard: 0.05,
      premium: 0.25
    };
    const estimatedCost = tierPrices[tier as keyof typeof tierPrices] || 0.01;

    if (estimatedCost > this.budget.maxPerRequest) {
      throw new Error('Request exceeds per-request budget limit');
    }

    if (this.budget.spent + estimatedCost > this.budget.dailyLimit) {
      throw new Error('Daily budget limit reached');
    }

    // Discover and select provider
    let provider: any;
    if (providerUrl) {
      provider = { url: providerUrl };
    } else {
      const providers = await this.discoverProviders();
      provider = await this.selectProvider(providers, tier);
      console.log(`✅ Selected provider: ${provider.provider?.name || 'Unknown'}`);
      console.log(`💰 Price: $${provider.pricing?.tiers?.[tier]?.price_usd || estimatedCost}`);
    }

    // Make inference request
    const result = await this.inference.generate({
      providerUrl: provider.url || providerUrl || process.env.DEFAULT_PROVIDER!,
      prompt,
      tier,
      maxTokens: tier === 'premium' ? 512 : tier === 'standard' ? 256 : 100
    });

    // Update budget
    this.budget.spent += estimatedCost;

    console.log(`✅ Inference completed`);
    console.log(`💸 Spent: $${estimatedCost.toFixed(2)} (Total: $${this.budget.spent.toFixed(2)}/${this.budget.dailyLimit})`);

    return result;
  }

  /**
   * Get wallet balance
   */
  async getBalance(): Promise<number> {
    const balance = await this.connection.getBalance(this.wallet.publicKey);
    return balance / 1e9; // Convert lamports to SOL
  }

  /**
   * Get budget status
   */
  getBudgetStatus(): any {
    return {
      maxPerRequest: this.budget.maxPerRequest,
      dailyLimit: this.budget.dailyLimit,
      spent: this.budget.spent,
      remaining: this.budget.dailyLimit - this.budget.spent,
      percentUsed: (this.budget.spent / this.budget.dailyLimit) * 100
    };
  }

  /**
   * Reset daily budget
   */
  resetBudget(): void {
    this.budget.spent = 0;
    console.log('✅ Daily budget reset');
  }
}

export default ParallaxPayClientAgent;
