import { useState, useCallback } from 'react';
import { useAtom } from 'jotai';
import { userAtom, profileAtom, isLoadingAtom } from '../store/auth';
import { 
  authenticateWithWallet, 
  storeWalletConnection, 
  disconnectWallet,
  formatWalletAddress,
  getWalletConnectionDetails
} from '../lib/web3';

export const useWeb3Auth = () => {
  const [user, setUser] = useAtom(userAtom);
  const [profile, setProfile] = useAtom(profileAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [error, setError] = useState<string | null>(null);

  const signInWithWallet = useCallback(async (address: string, signature: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Attempting Web3 authentication with:', { address, hasSignature: !!signature });

      // Authenticate and store wallet connection
      await authenticateWithWallet(address, signature);
      storeWalletConnection(address, signature);
      // Create a mock user object for Web3 users that matches Supabase User interface
      const mockUser = {
        id: address.toLowerCase(),
        email: `${address.toLowerCase()}@web3.local`,
        user_metadata: {
          wallet_address: address.toLowerCase(),
          auth_type: 'web3',
          full_name: '',
        },
      };
      setUser(mockUser as any);
      setIsLoading(false);
      return { user: mockUser, isNewUser: false };
    } catch (err: any) {
      console.error('Web3 authentication error:', err);
      const errorMessage = err.message || 'Failed to authenticate with wallet';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setProfile, setIsLoading]);

  const signOutWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      await disconnectWallet();
      setUser(null);
      setProfile(null);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect wallet');
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setProfile, setIsLoading]);

  const getWalletInfo = useCallback(() => {
    const details = getWalletConnectionDetails();
    return {
      address: details.address,
      formattedAddress: details.address ? formatWalletAddress(details.address) : null,
      isConnected: details.isConnected,
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check if there's an existing wallet connection on mount
  const checkExistingConnection = useCallback(async () => {
    const details = getWalletConnectionDetails();
    if (details.isConnected && details.address) {
      await signInWithWallet(details.address, '');
    }
  }, [signInWithWallet]);

  return {
    // State
    user,
    profile,
    isLoading,
    error,
    
    // Actions
    signInWithWallet,
    signOutWallet,
    clearError,
    checkExistingConnection,
    
    // Utils
    getWalletInfo,
    isWeb3User: user?.user_metadata?.auth_type === 'web3',
  };
};