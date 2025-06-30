import React from 'react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { currentPageAtom, type Page } from '../store/navigation';
import { isAuthenticatedAtom, userAtom, profileAtom } from '../store/auth';
import { Button } from './ui/button';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Navigation: React.FC = () => {
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [user] = useAtom(userAtom);
  const [profile] = useAtom(profileAtom);
  const { signOut } = useAuth();

  const navItems: { label: string; page: Page }[] = [
    { label: 'Home', page: 'home' },
    { label: 'Content Creation', page: 'content-creation' },
    { label: 'Content Automation', page: 'content-automation' },
    { label: 'Pricing', page: 'pricing' },
  ];

  const handleAuthAction = () => {
    if (isAuthenticated) {
      signOut();
      setCurrentPage('home');
    } else {
      setCurrentPage('login');
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 p-6"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
          <div className="w-8 h-8 bg-neon-gradient rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CP</span>
          </div>
          <span className="text-xl font-bold text-white font-jakarta">CreatorPilot</span>
        </div>

        <div className="flex items-center gap-6">
          {navItems.map(({ label, page }) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'text-neon-blue'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
          
          <div className="flex items-center gap-3 relative">
            {isAuthenticated && (user || profile) && (
              <div className="flex items-center gap-2 text-white/70">
                <User className="w-4 h-4" />
                <span className="text-sm">
                  {profile?.full_name || user?.email || 'User'}
                </span>
              </div>
            )}
            <Button
              onClick={handleAuthAction}
              variant={isAuthenticated ? "outline" : "default"}
              className="flex items-center gap-2"
            >
              {isAuthenticated ? (
                <>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            
            {/* White Circle Icon positioned below sign-in button */}
            <div className="absolute -bottom-12 right-0">
              <motion.img
                src="/images/white_circle_360x360.png"
                alt="Bolt.new"
                className="w-8 h-8 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open('https://bolt.new', '_blank')}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};