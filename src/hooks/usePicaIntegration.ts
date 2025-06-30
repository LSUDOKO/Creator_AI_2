import { useState, useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { 
  picaAPI, 
  PicaConnector, 
  PicaPostResponse, 
  getStoredConnectors, 
  removeStoredConnector,
  handlePicaCallback 
} from '../lib/pica';

export interface UsePicaIntegrationOptions {
  autoRefresh?: boolean;
}

export const usePicaIntegration = (options: UsePicaIntegrationOptions = {}) => {
  const [user] = useAtom(userAtom);
  const [connectedAccounts, setConnectedAccounts] = useState<PicaConnector[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load connected accounts
  const loadConnectedAccounts = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      if (picaAPI) {
        // Try to fetch from Pica API
        const accounts = await picaAPI.getConnectedAccounts(user.id);
        setConnectedAccounts(accounts);
      } else {
        // Fallback to localStorage for demo
        const storedAccounts = getStoredConnectors(user.id);
        setConnectedAccounts(storedAccounts);
      }
    } catch (err) {
      console.error('Error loading connected accounts:', err);
      setError('Failed to load connected accounts');
      
      // Fallback to localStorage
      const storedAccounts = getStoredConnectors(user.id);
      setConnectedAccounts(storedAccounts);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Connect a social media account
  const connectAccount = useCallback(async (platform: string) => {
    if (!user?.id || !picaAPI) {
      setError('User not authenticated or Pica not configured');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const callbackUrl = `${window.location.origin}/pica/callback`;
      const authData = await picaAPI.getConnectorAuthUrl({
        connector: platform,
        userId: user.id,
        callbackUrl,
      });

      // Open OAuth window
      const authWindow = window.open(
        authData.authUrl,
        'pica-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      // Listen for callback
      return new Promise<PicaConnector | null>((resolve) => {
        const checkClosed = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkClosed);
            // Refresh accounts after potential connection
            loadConnectedAccounts();
            resolve(null);
          }
        }, 1000);

        // Listen for message from callback
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'PICA_AUTH_SUCCESS') {
            clearInterval(checkClosed);
            authWindow?.close();
            window.removeEventListener('message', handleMessage);
            
            // Handle the callback data
            handlePicaCallback({
              connectorId: event.data.connectorId,
              accessToken: event.data.accessToken,
              userId: user.id,
              platform: event.data.platform,
              username: event.data.username,
            }).then((connector) => {
              loadConnectedAccounts();
              resolve(connector);
            });
          }
        };

        window.addEventListener('message', handleMessage);
      });
    } catch (err) {
      console.error('Error connecting account:', err);
      setError('Failed to connect account');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, loadConnectedAccounts]);

  // Disconnect a social media account
  const disconnectAccount = useCallback(async (connectorId: string) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      if (picaAPI) {
        await picaAPI.disconnectAccount(connectorId);
      }
      
      // Remove from localStorage
      removeStoredConnector(user.id, connectorId);
      
      // Refresh accounts
      await loadConnectedAccounts();
    } catch (err) {
      console.error('Error disconnecting account:', err);
      setError('Failed to disconnect account');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, loadConnectedAccounts]);

  // Post content using natural language
  const postWithAgent = useCallback(async (params: {
    prompt: string;
    mediaUrl?: string;
    contentType?: 'text' | 'image' | 'video';
  }): Promise<PicaPostResponse[]> => {
    if (!user?.id || !picaAPI) {
      throw new Error('User not authenticated or Pica not configured');
    }

    try {
      setIsLoading(true);
      setError(null);

      const results = await picaAPI.executeAgent({
        ...params,
        userId: user.id,
      });

      return results;
    } catch (err) {
      console.error('Error posting with agent:', err);
      setError('Failed to post content');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Post to specific platforms
  const postToPlatforms = useCallback(async (params: {
    content: string;
    platforms: string[];
    mediaUrl?: string;
    scheduleTime?: Date;
  }): Promise<PicaPostResponse[]> => {
    if (!user?.id || !picaAPI) {
      throw new Error('User not authenticated or Pica not configured');
    }

    try {
      setIsLoading(true);
      setError(null);

      const results = await picaAPI.postContent({
        ...params,
        userId: user.id,
      });

      return results;
    } catch (err) {
      console.error('Error posting to platforms:', err);
      setError('Failed to post content');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Load accounts on mount and when user changes
  useEffect(() => {
    loadConnectedAccounts();
  }, [loadConnectedAccounts]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (options.autoRefresh) {
      const interval = setInterval(loadConnectedAccounts, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, loadConnectedAccounts]);

  return {
    // State
    connectedAccounts,
    isLoading,
    error,
    
    // Actions
    connectAccount,
    disconnectAccount,
    postWithAgent,
    postToPlatforms,
    refreshAccounts: loadConnectedAccounts,
    
    // Utils
    isConnected: (platform: string) => 
      connectedAccounts.some(account => account.platform === platform && account.isConnected),
    getAccount: (platform: string) => 
      connectedAccounts.find(account => account.platform === platform),
  };
};