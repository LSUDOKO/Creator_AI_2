import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, Loader2, Crown } from 'lucide-react';
import { currentPageAtom } from '../store/navigation';
import { useStripe } from '../hooks/useStripe';

export const SuccessPage: React.FC = () => {
  const [, setCurrentPage] = useAtom(currentPageAtom);
  const [isLoading, setIsLoading] = useState(true);
  const { refetch } = useStripe();

  useEffect(() => {
    // Refresh subscription data after successful payment
    const refreshData = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for webhook processing
      await refetch();
      setIsLoading(false);
    };

    refreshData();
  }, [refetch]);

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="text-center">
            <CardContent className="p-8">
              {isLoading ? (
                <>
                  <Loader2 className="w-16 h-16 text-neon-blue mx-auto mb-6 animate-spin" />
                  <h1 className="text-2xl font-bold text-white mb-4">
                    Processing Your Subscription
                  </h1>
                  <p className="text-white/70">
                    Please wait while we set up your account...
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  
                  <h1 className="text-2xl font-bold text-white mb-4">
                    Welcome to CreatorPilot!
                  </h1>
                  
                  <p className="text-white/70 mb-6">
                    Your subscription has been activated successfully. You now have access to all premium features.
                  </p>

                  <div className="bg-neon-blue/10 border border-neon-blue/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 justify-center mb-2">
                      <Crown className="w-5 h-5 text-neon-blue" />
                      <span className="text-neon-blue font-medium">Premium Features Unlocked</span>
                    </div>
                    <ul className="text-sm text-white/70 space-y-1">
                      <li>• AI Avatar Video Generation</li>
                      <li>• Advanced Content Automation</li>
                      <li>• Priority Support</li>
                      <li>• Analytics & Insights</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={() => setCurrentPage('content-creation')}
                      className="w-full"
                    >
                      Start Creating Content
                    </Button>
                    
                    <Button 
                      onClick={() => setCurrentPage('home')}
                      variant="outline"
                      className="w-full"
                    >
                      Return to Home
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};