import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Check, Loader2, Crown, Zap } from 'lucide-react';
import { userAtom } from '../store/auth';
import { currentPageAtom } from '../store/navigation';
import { stripeProducts, createCheckoutSession } from '../lib/stripe';
import { useStripe } from '../hooks/useStripe';

export const PricingPage: React.FC = () => {
  const [user] = useAtom(userAtom);
  const [, setCurrentPage] = useAtom(currentPageAtom);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { subscription, hasActiveSubscription } = useStripe();

  const handleSubscribe = async (priceId: string, planId: string) => {
    if (!user) {
      setCurrentPage('login');
      return;
    }

    try {
      setLoadingPlan(planId);
      await createCheckoutSession(priceId, user.id);
    } catch (error) {
      console.error('Error starting checkout:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const isCurrentPlan = (planId: string) => {
    if (!subscription) return false;
    return subscription.product_name.toLowerCase().includes(planId.toLowerCase());
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glass backdrop-blur-md border border-white/20 text-sm text-white/80 mb-6">
            <Crown className="w-4 h-4 text-neon-blue" />
            Flexible Pricing Plans
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4 font-jakarta">
            Choose Your Plan
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Scale your content creation with AI-powered tools designed for creators
          </p>

          {hasActiveSubscription() && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl max-w-md mx-auto">
              <div className="flex items-center gap-2 justify-center">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">
                  You have an active {subscription?.product_name} subscription
                </span>
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {stripeProducts.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`h-full relative ${
                plan.popular 
                  ? 'border-neon-blue shadow-lg shadow-neon-blue/20 scale-105' 
                  : ''
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-neon-gradient px-4 py-1 text-white font-medium">
                      <Zap className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-white">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-white/60">/{plan.interval}</span>
                  </div>
                  <p className="text-white/70 mt-2">{plan.description}</p>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-neon-blue flex-shrink-0" />
                        <span className="text-white/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan(plan.id) ? (
                    <Button 
                      className="w-full" 
                      variant="secondary"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? 'default' : 'secondary'}
                      onClick={() => handleSubscribe(plan.priceId, plan.id)}
                      disabled={loadingPlan === plan.id}
                    >
                      {loadingPlan === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {hasActiveSubscription() ? 'Upgrade' : 'Get Started'}
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">Why Choose CreatorPilot?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-neon-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
                  <p className="text-white/70">
                    Generate realistic AI avatars and automate your content creation workflow
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-neon-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Premium Quality</h3>
                  <p className="text-white/70">
                    Professional-grade video generation with industry-leading AI technology
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-neon-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Easy to Use</h3>
                  <p className="text-white/70">
                    Intuitive interface designed for creators of all skill levels
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-white/70">
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Do you offer refunds?</h3>
              <p className="text-white/70">
                We offer a 30-day money-back guarantee for all new subscriptions. Contact support for assistance.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Can I upgrade or downgrade?</h3>
              <p className="text-white/70">
                Yes, you can change your plan at any time. Changes will be prorated and reflected in your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Is there a free trial?</h3>
              <p className="text-white/70">
                We offer a 7-day free trial for the Pro plan. No credit card required to start your trial.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};