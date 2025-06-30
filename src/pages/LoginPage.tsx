import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { WalletConnectButton } from '../components/Web3WalletConnector';
import { useAuth } from '../hooks/useAuth';
import { useWeb3Auth } from '../hooks/useWeb3Auth';
import { currentPageAtom } from '../store/navigation';
import { AlertCircle, Eye, EyeOff, Mail, Lock, User, Wallet } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [authMethod, setAuthMethod] = useState<'email' | 'web3'>('email');
  
  const { signIn, signUp, isLoading } = useAuth();
  const { 
    signInWithWallet, 
    isLoading: isWeb3Loading, 
    error: web3Error, 
    clearError,
    checkExistingConnection 
  } = useWeb3Auth();
  const [, setCurrentPage] = useAtom(currentPageAtom);

  // Check for existing Web3 connection on mount
  useEffect(() => {
    if (authMethod === 'web3') {
      checkExistingConnection();
    }
  }, [authMethod, checkExistingConnection]);

  const validateForm = () => {
    if (authMethod === 'web3') return true; // Web3 validation handled in connector
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return false;
    }

    if (!isLogin && !fullName) {
      setError('Please enter your full name');
      return false;
    }

    // Password length validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          // Store remember me preference
          if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
          }
          setCurrentPage('content-creation');
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          // Handle specific error cases with better messaging
          if (error.message.includes('User already registered')) {
            setError('An account with this email already exists. Please sign in instead.');
            // Automatically switch to login mode
            setTimeout(() => {
              setIsLogin(true);
              setError('');
            }, 3000);
          } else if (error.message.includes('weak_password')) {
            setError('Password must be at least 6 characters long');
          } else {
            setError(error.message);
          }
        } else {
          setError('');
          alert('Check your email for verification link!');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const handleWeb3Success = async (address: string, signature: string, message: string) => {
    try {
      setError('');
      clearError();
      
      console.log('Web3 authentication initiated:', { address, hasSignature: !!signature });
      
      const { isNewUser } = await signInWithWallet(address, signature, message);
      
      if (isNewUser) {
        alert('Welcome! Your Web3 account has been created successfully.');
      } else {
        console.log('Welcome back! Signed in with existing Web3 account.');
      }
      
      setCurrentPage('content-creation');
    } catch (err: any) {
      console.error('Web3 authentication failed:', err);
      setError(err.message || 'Failed to authenticate with wallet');
    }
  };

  const handleWeb3Error = (errorMessage: string) => {
    console.error('Web3 connection error:', errorMessage);
    setError(errorMessage);
  };

  const handleAuthMethodChange = (method: 'email' | 'web3') => {
    setAuthMethod(method);
    setError('');
    clearError();
    
    // Clear form fields when switching methods
    if (method === 'web3') {
      setEmail('');
      setPassword('');
      setFullName('');
    }
  };

  const currentError = error || web3Error;
  const currentLoading = isLoading || isWeb3Loading;

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200" 
          alt="Background" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-deep-blue/80 to-black/60"></div>
      </div>

      <div className="max-w-md w-full mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="backdrop-blur-md bg-glass border-white/20">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-neon-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
              <p className="text-white/70">
                {isLogin 
                  ? 'Sign in to your CreatorPilot account' 
                  : 'Join thousands of creators using AI'
                }
              </p>
            </CardHeader>

            <CardContent>
              {/* Auth Method Selection */}
              <div className="flex gap-2 mb-6 p-1 bg-white/10 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleAuthMethodChange('email')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    authMethod === 'email'
                      ? 'bg-neon-gradient text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => handleAuthMethodChange('web3')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    authMethod === 'web3'
                      ? 'bg-neon-gradient text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Wallet className="w-4 h-4 inline mr-2" />
                  Web3
                </button>
              </div>

              {currentError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 mb-4">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{currentError}</span>
                </div>
              )}

              {authMethod === 'email' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="bg-white/10 border-white/20 text-white"
                        required={!isLogin}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isLogin ? "Enter your password" : "Enter password (min. 6 characters)"}
                        className="bg-white/10 border-white/20 text-white pr-10"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {!isLogin && (
                      <p className="text-xs text-white/60">
                        Password must be at least 6 characters long
                      </p>
                    )}
                  </div>

                  {isLogin && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-white/20 bg-white/10"
                      />
                      <Label htmlFor="rememberMe" className="text-sm text-white/70">
                        Remember me
                      </Label>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={currentLoading}
                  >
                    {currentLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Wallet className="w-16 h-16 text-neon-blue mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {isLogin ? 'Connect Your Wallet' : 'Create Web3 Account'}
                    </h3>
                    <p className="text-sm text-white/70 mb-6">
                      {isLogin 
                        ? 'Sign in securely using your Web3 wallet'
                        : 'Create an account using your Web3 wallet identity'
                      }
                    </p>
                    
                    <WalletConnectButton
                      onSuccess={handleWeb3Success}
                      onError={handleWeb3Error}
                      className="w-full bg-neon-gradient hover:opacity-90"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      {isLogin ? 'Connect Wallet to Sign In' : 'Connect Wallet to Sign Up'}
                    </WalletConnectButton>
                  </div>

                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Wallet className="w-4 h-4 text-blue-400 mt-0.5" />
                      <div className="text-xs text-blue-400">
                        <p className="font-medium mb-1">Secure Web3 Authentication</p>
                        <ul className="space-y-1 text-blue-300">
                          <li>• No passwords required</li>
                          <li>• Cryptographic signature verification</li>
                          <li>• Your keys, your identity</li>
                          <li>• No gas fees for authentication</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    clearError();
                  }}
                  className="text-neon-blue hover:underline text-sm"
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};