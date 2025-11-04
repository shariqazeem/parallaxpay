import axios from 'axios';
import { PaymentService } from './payment';

interface InferenceRequest {
  providerUrl: string;
  prompt: string;
  tier: string;
  maxTokens: number;
}

export class InferenceClient {
  constructor(private payment: PaymentService) {}

  /**
   * Generate AI completion with automatic payment
   */
  async generate(request: InferenceRequest): Promise<any> {
    const { providerUrl, prompt, tier, maxTokens } = request;

    try {
      // First, try request without payment (will get 402)
      console.log(`📡 Sending inference request to ${providerUrl}`);

      const inferenceUrl = `${providerUrl}/v1/inference`;

      try {
        const response = await axios.post(inferenceUrl, {
          prompt,
          max_tokens: maxTokens,
          temperature: 0.7
        }, {
          timeout: 60000
        });

        // If we get here, payment wasn't required (or already cached)
        return response.data;

      } catch (error: any) {
        // Check if we got 402 Payment Required
        if (error.response && error.response.status === 402) {
          console.log('💳 Payment required - processing payment...');

          const paymentInfo = error.response.data;
          const recipient = paymentInfo.recipient;
          const price = paymentInfo.pricing?.[tier]?.price || 0.01;

          // Create and send payment
          const signature = await this.payment.createPayment(recipient, price);

          // Retry request with payment header
          console.log('🔄 Retrying request with payment proof...');

          const paymentHeader = this.payment.createPaymentHeader(signature, price);

          const retryResponse = await axios.post(inferenceUrl, {
            prompt,
            max_tokens: maxTokens,
            temperature: 0.7
          }, {
            headers: {
              'X-Payment': paymentHeader
            },
            timeout: 60000
          });

          return retryResponse.data;

        } else {
          throw error;
        }
      }

    } catch (error: any) {
      console.error('❌ Inference request failed:', error.message);
      throw error;
    }
  }
}
