import axios from 'axios';

interface GenerateRequest {
  prompt: string;
  model: string;
  max_tokens: number;
  temperature: number;
}

interface GenerateResponse {
  completion: string;
  tokens: number;
  model: string;
}

/**
 * Parallax Service
 *
 * Interfaces with Gradient Parallax scheduler for distributed LLM inference
 */
class ParallaxService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.PARALLAX_SCHEDULER_URL || 'http://localhost:3001';
  }

  /**
   * Generate AI completion using Gradient Parallax
   */
  async generateCompletion(request: GenerateRequest): Promise<GenerateResponse> {
    try {
      console.log(`🌊 Calling Parallax at ${this.baseUrl}/v1/chat/completions`);

      const response = await axios.post(
        `${this.baseUrl}/v1/chat/completions`,
        {
          model: request.model,
          messages: [
            {
              role: 'user',
              content: request.prompt
            }
          ],
          max_tokens: request.max_tokens,
          temperature: request.temperature,
          stream: false
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 second timeout
        }
      );

      const data = response.data;

      console.log('📦 Parallax raw response:', JSON.stringify(data, null, 2));

      // Parse OpenAI-compatible response
      if (data.choices && data.choices.length > 0) {
        const choice = data.choices[0];

        // Parallax uses "messages" (plural) instead of "message" (singular)
        // Support both formats for compatibility
        const completion =
          choice.messages?.content ||      // Parallax format
          choice.message?.content ||       // OpenAI format
          choice.text ||                   // Alternative format
          choice.delta?.content ||         // Streaming format
          '';

        console.log('✨ Extracted completion:', completion);

        return {
          completion,
          tokens: data.usage?.completion_tokens || data.usage?.total_tokens || request.max_tokens,
          model: data.model || request.model
        };
      }

      // If no choices, check if response has text directly
      if (data.text || data.content) {
        const completion = data.text || data.content;
        console.log('✨ Extracted completion (direct):', completion);
        return {
          completion,
          tokens: data.tokens || request.max_tokens,
          model: data.model || request.model
        };
      }

      console.error('❌ Invalid Parallax response structure:', data);
      throw new Error('Invalid response from Parallax');

    } catch (error: any) {
      console.error('❌ Parallax API error:', error.message);

      // If Parallax is not available, return mock response for demo
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        console.warn('⚠️ Parallax not available, returning mock response');
        return this.mockCompletion(request);
      }

      throw error;
    }
  }

  /**
   * Mock completion for demo/testing when Parallax is not available
   */
  private mockCompletion(request: GenerateRequest): GenerateResponse {
    const mockResponses = [
      'This is a mock AI response from ParallaxPay. In production, this would be powered by Gradient Parallax distributed inference.',
      'Solana is a high-performance blockchain designed for decentralized applications and crypto currencies. It achieves fast transaction speeds through its innovative Proof of History consensus mechanism.',
      'The x402 protocol enables seamless micropayments for web content and APIs. It brings the long-dormant HTTP 402 status code to life, enabling true pay-per-use models.',
      'Gradient Parallax is a fully decentralized inference engine that lets you build AI clusters for model inference across distributed nodes with varying configurations.'
    ];

    return {
      completion: mockResponses[Math.floor(Math.random() * mockResponses.length)],
      tokens: Math.min(request.max_tokens, 100),
      model: request.model
    };
  }

  /**
   * Check if Parallax scheduler is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export const parallaxService = new ParallaxService();
