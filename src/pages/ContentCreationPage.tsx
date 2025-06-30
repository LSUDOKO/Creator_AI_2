import React from 'react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { ReplicaPersonaManager } from '../components/dashboard/ReplicaPersonaManager';
import { EnhancedVideoGenerator } from '../components/dashboard/EnhancedVideoGenerator';
import { AudioVideoGenerator } from '../components/dashboard/AudioVideoGenerator';
import { MetaVideoPosting } from '../components/dashboard/MetaVideoPosting';
import { userAtom, profileAtom } from '../store/auth';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { LogOut, User } from 'lucide-react';
import { currentPageAtom } from '../store/navigation';

export const ContentCreationPage: React.FC = () => {
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
                    : 'Content Creation Studio'
                  }
                </h1>
                <p className="text-white/70">
                  {isAuthenticated 
                    ? 'Create AI-powered videos and manage your digital replicas'
                    : 'Sign in to access your personalized content creation tools'
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

            {/* Meta Video Posting */}
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <MetaVideoPosting />
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
                alt="Content Creation Preview" 
                className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
              />
              <h2 className="text-2xl font-bold text-white mb-4">Access Content Creation Tools</h2>
              <p className="text-white/70 mb-6">
                Sign in to unlock powerful AI tools for video generation, replica management, and content automation.
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