import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

export interface StripeProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  priceId: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individual creators',
    price: 29,
    priceId: 'price_starter_monthly', // Replace with actual Stripe price ID
    interval: 'month',
    features: [
      '10 AI avatar videos per month',
      'Basic auto-captions',
      'Content calendar',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing creators and teams',
    price: 79,
    priceId: 'price_pro_monthly', // Replace with actual Stripe price ID
    interval: 'month',
    features: [
      '50 AI avatar videos per month',
      'Advanced auto-captions & hashtags',
      'Smart scheduling',
      'Competitor analysis',
      'Audience insights',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For agencies and large teams',
    price: 199,
    priceId: 'price_enterprise_monthly', // Replace with actual Stripe price ID
    interval: 'month',
    features: [
      'Unlimited AI avatar videos',
      'Custom AI training',
      'White-label solution',
      'Advanced analytics',
      'API access',
      'Dedicated support',
    ],
  },
];

export const createCheckoutSession = async (priceId: string, userId?: string) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { sessionId } = await response.json();
    
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const createPortalSession = async (customerId: string) => {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};

export { stripePromise };