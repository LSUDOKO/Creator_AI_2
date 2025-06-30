import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { currentPageAtom } from './store/navigation';
import { SplashCursor } from './components/SplashCursor';
import { Navigation } from './components/Navigation';
import { FloatingAssistant } from './components/FloatingAssistant';
import { HomePage } from './pages/HomePage';
import { ContentCreationPage } from './pages/ContentCreationPage';
import { ContentAutomationPage } from './pages/ContentAutomationPage';
import { PricingPage } from './pages/PricingPage';
import { LoginPage } from './pages/LoginPage';
import { SuccessPage } from './pages/SuccessPage';
import { useAuth } from './hooks/useAuth';

function App() {
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom);
  const { isLoading } = useAuth();

  // Show loading only for a maximum of 3 seconds
  const [showLoading, setShowLoading] = React.useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3000); // Maximum 3 seconds loading

    return () => clearTimeout(timer);
  }, []);

  // Handle URL-based routing for success page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId && window.location.pathname === '/success') {
      setCurrentPage('success');
    }
  }, [setCurrentPage]);

  // Show loading while checking auth state, but not indefinitely
  if (isLoading && showLoading) {
    return (
      <div className="min-h-screen bg-deep-blue flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'content-creation':
        return <ContentCreationPage />;
      case 'content-automation':
        return <ContentAutomationPage />;
      case 'pricing':
        return <PricingPage />;
      case 'login':
        return <LoginPage />;
      case 'success':
        return <SuccessPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <SplashCursor />
      
      <div className="relative z-10">
        <Navigation />
        {renderPage()}
      </div>

      <FloatingAssistant />
    </div>
  );
}

export default App;