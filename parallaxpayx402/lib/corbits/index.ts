/**
 * Corbits x402 Integration for Solana
 * Provides easy-to-use helpers for x402 payments using @faremeter packages
 */

export {
  createPhantomCorbitsWallet,
  isPhantomInstalled,
  getWalletBalance,
  type CorbitsWallet,
  type PhantomProvider,
} from './wallet';

export {
  createPaymentFetch,
  makePaymentRequest,
  callHeliusAPI,
  type PaymentHandlerOptions,
} from './payment';

export { useCorbitsPay, type UseCorbitPayOptions } from './hooks/useCorbitsPay';

export { WalletButton, type WalletButtonProps } from './components/WalletButton';
