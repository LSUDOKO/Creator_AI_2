import { useState, useCallback } from 'react';
import { useAtom } from 'jotai';
import { userAtom, profileAtom, isLoadingAtom } from '../store/auth';
import { 
  authenticateWithWallet, 
  storeWalletConnection, 
  disconnectWallet,
  getConnectedWallet,
  formatWalletAddress,
  getWalletConnectionDetails
} from '../lib/web3';

export const useWeb3Auth = () => {
  const [user, setUser] = useAtom(userAtom);
  const [profile, setProfile] = useAtom(profileAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [error, setError] = useState<string | null>(null);

  const signInWithWallet = useCallback(async (address: string, signature: string, message?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Attempting Web3 authentication with:', { address, hasSignature: !!signature });

      // Use the message if provided, otherwise try to get from storage
      const authMessage = message || localStorage.getItem('wallet_message') || '';
      
      const { user: walletUser, isNewUser } = await authenticateWithWallet(address, signature, authMessage);
      
      // Store wallet connection
      storeWalletConnection(address, signature, authMessage);
      
      // Create a mock user object for Web3 users that matches Supabase User interface
      const mockUser = {
        id: walletUser.id,
        email: `${address.toLowerCase()}@web3.local`,
        user_metadata: {
          wallet_address: address.toLowerCase(),
          auth_type: 'web3',
          full_name: walletUser.full_name,
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: walletUser.updated_at,
        updated_at: walletUser.updated_at,
        email_confirmed_at: walletUser.updated_at,
        phone_confirmed_at: null,
        confirmed_at: walletUser.updated_at,
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        factors: [],
        identities: [],
      };

      setUser(mockUser as any);
      setProfile(walletUser);

      console.log('Web3 authentication successful:', { user: mockUser, profile: walletUser, isNewUser });

      return { user: mockUser, profile: walletUser, isNewUser };
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
      signature: details.signature,
      message: details.message,
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check if there's an existing wallet connection on mount
  const checkExistingConnection = useCallback(async () => {
    const details = getWalletConnectionDetails();
    if (details.isConnected && details.address && details.signature) {
      try {
        await signInWithWallet(details.address, details.signature, details.message || '');
      } catch (error) {
        console.log('Failed to restore wallet session:', error);
        // Clear invalid connection
        await disconnectWallet();
      }
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