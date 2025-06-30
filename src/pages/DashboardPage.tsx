import React from 'react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { ContentCalendar } from '../components/dashboard/ContentCalendar';
import { AnalyticsDashboard } from '../components/dashboard/AnalyticsDashboard';
import { EnhancedVideoGenerator } from '../components/dashboard/EnhancedVideoGenerator';
import { AudioVideoGenerator } from '../components/dashboard/AudioVideoGenerator';
import { SocialMediaConnector } from '../components/dashboard/SocialMediaConnector';
import { ReplicaPersonaManager } from '../components/dashboard/ReplicaPersonaManager';
import { userAtom, profileAtom } from '../store/auth';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { LogOut, User } from 'lucide-react';
import { currentPageAtom } from '../store/navigation';

export const DashboardPage: React.FC = () => {
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
                    : 'Creator Dashboard'
                  }
                </h1>
                <p className="text-white/70">
                  {isAuthenticated 
                    ? 'Manage your content, automate your workflow, and grow your audience'
                    : 'Sign in to access your personalized dashboard'
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
            {/* AI Assets Management */}
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <ReplicaPersonaManager />
              </motion.div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Left Panel - Enhanced Video Generator */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <EnhancedVideoGenerator />
              </motion.div>

              {/* Right Panel - Audio Video Generator */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                <AudioVideoGenerator />
              </motion.div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Social Media Connector */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="h-[600px] overflow-y-auto"
              >
                <SocialMediaConnector />
              </motion.div>

              {/* Analytics */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
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
                transition={{ delay: 1.0 }}
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
                alt="Dashboard Preview" 
                className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
              />
              <h2 className="text-2xl font-bold text-white mb-4">Access Your Dashboard</h2>
              <p className="text-white/70 mb-6">
                Sign in to unlock powerful AI tools for content creation, analytics, and automation.
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