export interface PaymentProvider {
  createCheckoutSession(userId: string, productId: string, email?: string): Promise<string>
  cancelSubscription(subscriptionId: string): Promise<void>
  getSubscription(subscriptionId: string): Promise<any>
}

export { PolarProvider } from './polar'
export { StripeProvider } from './stripe'
