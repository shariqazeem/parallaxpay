import { Connection, Keypair, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

export class PaymentService {
  constructor(
    private connection: Connection,
    private wallet: Keypair
  ) {}

  /**
   * Create a payment transaction
   */
  async createPayment(
    recipient: string,
    amountUSD: number
  ): Promise<string> {
    try {
      console.log(`💸 Creating payment: $${amountUSD} to ${recipient}`);

      // In production, this would create a USDC transfer
      // For demo, we'll create a minimal SOL transfer as proof of payment
      const recipientPubkey = new PublicKey(recipient);
      const lamports = Math.floor(amountUSD * 1e6); // Convert USD to small amount

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.wallet.publicKey,
          toPubkey: recipientPubkey,
          lamports
        })
      );

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.wallet.publicKey;

      // Sign transaction
      transaction.sign(this.wallet);

      // Send transaction
      const signature = await this.connection.sendRawTransaction(
        transaction.serialize()
      );

      console.log(`✅ Payment sent: ${signature}`);

      // Wait for confirmation
      await this.connection.confirmTransaction(signature, 'confirmed');

      console.log(`✅ Payment confirmed`);

      return signature;

    } catch (error: any) {
      console.error('❌ Payment failed:', error.message);
      throw error;
    }
  }

  /**
   * Get payment header for x402 request
   */
  createPaymentHeader(signature: string, amount: number): string {
    return JSON.stringify({
      transaction: signature,
      amount,
      timestamp: Date.now()
    });
  }

  /**
   * Check wallet balance
   */
  async getBalance(): Promise<number> {
    const balance = await this.connection.getBalance(this.wallet.publicKey);
    return balance / 1e9; // Convert to SOL
  }
}
