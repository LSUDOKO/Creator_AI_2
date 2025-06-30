import React from 'react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { SocialMediaConnector } from '../components/dashboard/SocialMediaConnector';
import { AnalyticsDashboard } from '../components/dashboard/AnalyticsDashboard';
import { ContentCalendar } from '../components/dashboard/ContentCalendar';
import { userAtom, profileAtom } from '../store/auth';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { LogOut, User } from 'lucide-react';
import { currentPageAtom } from '../store/navigation';

export const ContentAutomationPage: React.FC = () => {
  const [user] = useAtom(userAtom);
  const [profile] = useAtom(profileAtom);
  const [, setCurrentPage] = useAtom(currentPageAtom);
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setCurrentPage('home');
  };

  // Show dashboard even if not authenticated, but with different content
  const isAuthenticated = !!user;

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-neon-gradient rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 font-jakarta">
                  {isAuthenticated 
                    ? `Welcome, ${profile?.full_name || user.email}!`
                    : 'Content Automation Hub'
                  }
                </h1>
                <p className="text-white/70">
                  {isAuthenticated 
                    ? 'Automate your social media posting and track performance'
                    : 'Sign in to access your personalized automation dashboard'
                  }
                </p>
              </div>
            </div>
            {isAuthenticated && (
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </Button>
            )}
          </div>
        </motion.div>

        {isAuthenticated ? (
          <>
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Social Media Connector */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="h-[600px] overflow-y-auto"
              >
                <SocialMediaConnector />
              </motion.div>

              {/* Analytics */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="h-[600px] overflow-y-auto"
              >
                <AnalyticsDashboard />
              </motion.div>
            </div>

            <div className="grid lg:grid-cols-1 gap-8">
              {/* Content Calendar */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <ContentCalendar />
              </motion.div>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <img 
                src="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400" 
                alt="Automation Preview" 
                className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
              />
              <h2 className="text-2xl font-bold text-white mb-4">Access Automation Tools</h2>
              <p className="text-white/70 mb-6">
                Sign in to unlock powerful automation features for social media posting, analytics, and content scheduling.
              </p>
              <Button 
                onClick={() => setCurrentPage('login')}
                className="px-8 py-3"
              >
                Sign In to Continue
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};