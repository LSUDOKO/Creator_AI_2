import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { 
  Wallet, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Shield,
  X
} from 'lucide-react';
import { 
  getAvailableWallets, 
  connectWallet, 
  formatWalletAddress,
  isWeb3Supported,
  Web3WalletProvider 
} from '../lib/web3';

interface Web3WalletConnectorProps {
  onSuccess: (address: string, signature: string, message: string) => void;
  onError: (error: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Web3WalletConnector: React.FC<Web3WalletConnectorProps> = ({
  onSuccess,
  onError,
  isOpen,
  onClose,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [connectionStep, setConnectionStep] = useState<'select' | 'connecting' | 'signing' | 'success'>('select');
  const [connectedAddress, setConnectedAddress] = useState<string>('');

  const availableWallets = getAvailableWallets();
  const isWeb3Available = isWeb3Supported();

  const resetState = () => {
    setIsConnecting(false);
    setSelectedWallet(null);
    setConnectionStep('select');
    setConnectedAddress('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleWalletConnect = async (walletName: string) => {
    try {
      setIsConnecting(true);
      setSelectedWallet(walletName);
      setConnectionStep('connecting');

      console.log(`Connecting to ${walletName}...`);

      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setConnectionStep('signing');
      
      const result = await connectWallet(walletName);
      
      console.log('Wallet connection result:', {
        address: result.address,
        hasSignature: !!result.signature,
        messageLength: result.message?.length || 0
      });

      setConnectedAddress(result.address);
      setConnectionStep('success');
      
      // Small delay to show success state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success - call the callback
      onSuccess(result.address, result.signature, result.message);
      handleClose();
      
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      
      let errorMessage = 'Failed to connect wallet';
      
      if (error.message.includes('User rejected')) {
        errorMessage = 'Connection request was rejected. Please try again.';
      } else if (error.message.includes('User denied')) {
        errorMessage = 'Message signature was denied. Please try again.';
      } else if (error.message.includes('already processing')) {
        errorMessage = 'MetaMask is already processing a request. Please check your wallet.';
      } else if (error.message.includes('not installed')) {
        errorMessage = 'MetaMask is not installed. Please install MetaMask first.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      onError(errorMessage);
      setConnectionStep('select');
      setIsConnecting(false);
      setSelectedWallet(null);
    }
  };

  const openMetaMaskDownload = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  if (!isWeb3Available) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Web3 Not Supported
            </DialogTitle>
            <DialogDescription>
              Your browser doesn't support Web3 wallets. Please install a Web3 wallet like MetaMask to continue.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🦊</span>
                <div className="flex-1">
                  <h3 className="font-medium text-white">MetaMask</h3>
                  <p className="text-sm text-white/60">Most popular Ethereum wallet</p>
                </div>
                <Button onClick={openMetaMaskDownload} size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Install
                </Button>
              </div>
            </Card>
            
            <Button onClick={handleClose} variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Connect Web3 Wallet
          </DialogTitle>
          <DialogDescription>
            Choose a wallet to connect and authenticate with your Web3 identity
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {connectionStep === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {availableWallets.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {availableWallets.map((wallet) => (
                      <Card 
                        key={wallet.name}
                        className="cursor-pointer hover:bg-white/10 transition-colors border-white/20"
                        onClick={() => !isConnecting && handleWalletConnect(wallet.name)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{wallet.icon}</span>
                            <div className="flex-1">
                              <h3 className="font-medium text-white">{wallet.name}</h3>
                              <p className="text-sm text-white/60">
                                {wallet.name === 'MetaMask' 
                                  ? 'Connect using MetaMask wallet'
                                  : 'Connect using WalletConnect protocol'
                                }
                              </p>
                            </div>
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-400 mt-0.5" />
                      <div className="text-xs text-blue-400">
                        <p className="font-medium mb-1">Secure Web3 Authentication</p>
                        <p>Your wallet signature proves ownership without sharing private keys. No gas fees required.</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <h3 className="font-medium text-white mb-2">No Wallets Found</h3>
                  <p className="text-sm text-white/60 mb-4">
                    Please install a Web3 wallet like MetaMask to continue.
                  </p>
                  <Button onClick={openMetaMaskDownload}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Install MetaMask
                  </Button>
                </div>
              )}

              <Button onClick={handleClose} variant="outline" className="w-full">
                Cancel
              </Button>
            </motion.div>
          )}

          {connectionStep === 'connecting' && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-8"
            >
              <Loader2 className="w-12 h-12 text-neon-blue mx-auto mb-4 animate-spin" />
              <h3 className="font-medium text-white mb-2">Connecting to {selectedWallet}</h3>
              <p className="text-sm text-white/60">
                Please check your wallet and approve the connection request.
              </p>
            </motion.div>
          )}

          {connectionStep === 'signing' && (
            <motion.div
              key="signing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-8"
            >
              <div className="w-12 h-12 bg-neon-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-medium text-white mb-2">Sign Message</h3>
              <p className="text-sm text-white/60 mb-4">
                Please sign the message in your wallet to complete authentication.
              </p>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-xs text-yellow-400">
                  💡 This signature proves you own the wallet address. No transaction or gas fees required.
                </p>
              </div>
            </motion.div>
          )}

          {connectionStep === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-8"
            >
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="font-medium text-white mb-2">Successfully Connected!</h3>
              <p className="text-sm text-white/60 mb-4">
                Wallet: {formatWalletAddress(connectedAddress)}
              </p>
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-xs text-green-400">
                  ✅ Authentication successful. Redirecting...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

// Wallet connection button component
interface WalletConnectButtonProps {
  onSuccess: (address: string, signature: string, message: string) => void;
  onError: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  onSuccess,
  onError,
  className,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        className={className}
      >
        {children || (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </>
        )}
      </Button>

      <Web3WalletConnector
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={onSuccess}
        onError={onError}
      />
    </>
  );
};