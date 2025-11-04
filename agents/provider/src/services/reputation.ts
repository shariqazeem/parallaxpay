/**
 * Reputation Tracker
 *
 * Tracks provider performance metrics for on-chain reputation system
 *
 * Metrics tracked:
 * - Total transactions
 * - Success/failure rate
 * - Average response time
 * - Total tokens generated
 * - Revenue by tier
 */

interface Transaction {
  success: boolean;
  duration: number;
  tier: string;
  tokens: number;
  timestamp?: number;
}

interface ReputationStats {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  successRate: number;
  averageResponseTime: number;
  totalTokens: number;
  tierBreakdown: {
    [tier: string]: {
      count: number;
      revenue: number;
    };
  };
  uptime: number;
}

class ReputationTracker {
  private transactions: Transaction[] = [];
  private startTime: number;
  private pricing: { [key: string]: number };

  constructor() {
    this.startTime = Date.now();
    this.pricing = {
      basic: parseFloat(process.env.BASIC_PRICE || '0.01'),
      standard: parseFloat(process.env.STANDARD_PRICE || '0.05'),
      premium: parseFloat(process.env.PREMIUM_PRICE || '0.25')
    };
  }

  /**
   * Record a transaction
   */
  recordTransaction(tx: Transaction): void {
    this.transactions.push({
      ...tx,
      timestamp: Date.now()
    });

    // Log milestone
    if (this.transactions.length % 10 === 0) {
      console.log(`📊 Milestone: ${this.transactions.length} transactions processed`);
    }
  }

  /**
   * Get current reputation stats
   */
  getStats(): ReputationStats {
    const total = this.transactions.length;
    const successful = this.transactions.filter(tx => tx.success).length;
    const failed = total - successful;

    const avgResponseTime = total > 0
      ? this.transactions.reduce((sum, tx) => sum + tx.duration, 0) / total
      : 0;

    const totalTokens = this.transactions
      .filter(tx => tx.success)
      .reduce((sum, tx) => sum + tx.tokens, 0);

    // Calculate tier breakdown
    const tierBreakdown: { [key: string]: { count: number; revenue: number } } = {};
    this.transactions.forEach(tx => {
      if (!tierBreakdown[tx.tier]) {
        tierBreakdown[tx.tier] = { count: 0, revenue: 0 };
      }
      tierBreakdown[tx.tier].count++;
      if (tx.success) {
        tierBreakdown[tx.tier].revenue += this.pricing[tx.tier] || 0;
      }
    });

    return {
      totalTransactions: total,
      successfulTransactions: successful,
      failedTransactions: failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      averageResponseTime: Math.round(avgResponseTime),
      totalTokens,
      tierBreakdown,
      uptime: Date.now() - this.startTime
    };
  }

  /**
   * Get recent transactions
   */
  getRecentTransactions(limit: number = 10): Transaction[] {
    return this.transactions.slice(-limit);
  }

  /**
   * Export stats for on-chain storage
   */
  exportForOnChain(): string {
    const stats = this.getStats();
    return JSON.stringify({
      provider: 'ParallaxPay',
      stats,
      timestamp: Date.now()
    });
  }

  /**
   * Reset stats (for testing)
   */
  reset(): void {
    this.transactions = [];
    this.startTime = Date.now();
  }
}

export const reputationTracker = new ReputationTracker();
