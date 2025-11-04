import axios from 'axios';

interface Provider {
  url: string;
  provider?: {
    name: string;
    address: string;
    region: string;
  };
  pricing?: {
    tiers: {
      [key: string]: {
        price_usd: number;
        max_tokens: number;
      };
    };
  };
  reputation?: {
    total_transactions: number;
    success_rate: number;
    avg_response_time_ms: number;
    rating: number;
  };
  endpoints?: {
    inference: string;
    payment: string;
  };
}

export class ProviderDiscovery {
  private registryUrl: string;
  private knownProviders: string[];

  constructor() {
    this.registryUrl = process.env.PROVIDER_REGISTRY_URL || 'http://localhost:4001';
    this.knownProviders = [
      'http://localhost:4001',
      process.env.DEFAULT_PROVIDER,
    ].filter(Boolean) as string[];
  }

  /**
   * Discover available providers
   */
  async findProviders(): Promise<Provider[]> {
    const providers: Provider[] = [];

    // Query known providers
    for (const url of this.knownProviders) {
      try {
        const provider = await this.queryProvider(url);
        if (provider) {
          providers.push(provider);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to query provider ${url}:`, (error as Error).message);
      }
    }

    // TODO: Query decentralized provider registry on-chain
    // This would fetch a list of registered providers from a Solana program

    return providers;
  }

  /**
   * Query a specific provider's capabilities
   */
  async queryProvider(url: string): Promise<Provider | null> {
    try {
      const response = await axios.get(`${url}/api/discovery`, {
        timeout: 5000
      });

      return {
        url,
        ...response.data
      };
    } catch (error) {
      // Try fallback endpoint
      try {
        const response = await axios.get(`${url}/api/info`, {
          timeout: 5000
        });

        return {
          url,
          provider: {
            name: response.data.name,
            address: response.data.address,
            region: response.data.region || 'unknown'
          },
          pricing: {
            tiers: {
              basic: {
                price_usd: response.data.pricing?.basic || 0.01,
                max_tokens: 100
              },
              standard: {
                price_usd: response.data.pricing?.standard || 0.05,
                max_tokens: 256
              },
              premium: {
                price_usd: response.data.pricing?.premium || 0.25,
                max_tokens: 512
              }
            }
          },
          reputation: response.data.reputation || {
            total_transactions: 0,
            success_rate: 100,
            avg_response_time_ms: 0,
            rating: 5.0
          },
          endpoints: response.data.endpoints
        };
      } catch {
        return null;
      }
    }
  }

  /**
   * Add a provider to known list
   */
  addProvider(url: string): void {
    if (!this.knownProviders.includes(url)) {
      this.knownProviders.push(url);
      console.log(`✅ Added provider: ${url}`);
    }
  }

  /**
   * Remove a provider from known list
   */
  removeProvider(url: string): void {
    this.knownProviders = this.knownProviders.filter(p => p !== url);
    console.log(`✅ Removed provider: ${url}`);
  }

  /**
   * Get provider health
   */
  async checkHealth(url: string): Promise<boolean> {
    try {
      const response = await axios.get(`${url}/health`, {
        timeout: 3000
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}
