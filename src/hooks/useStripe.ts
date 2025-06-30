import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { supabase } from '../lib/supabase';

export interface Subscription {
  id: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  product_name: string;
  price_amount: number;
  stripe_customer_id: string;
}

export const useStripe = () => {
  const [user] = useAtom(userAtom);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setIsLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSubscription(data);
    } catch (err: any) {
      console.error('Error fetching subscription:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const hasActiveSubscription = () => {
    return subscription && subscription.status === 'active';
  };

  const isSubscriptionCanceled = () => {
    return subscription && subscription.cancel_at_period_end;
  };

  const getSubscriptionEndDate = () => {
    if (!subscription) return null;
    return new Date(subscription.current_period_end);
  };

  return {
    subscription,
    isLoading,
    error,
    hasActiveSubscription,
    isSubscriptionCanceled,
    getSubscriptionEndDate,
    refetch: fetchSubscription,
  };
};