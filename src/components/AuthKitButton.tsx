import React, { useState } from 'react';
import { useAuthKit } from '@picahq/authkit';
import { Button } from './ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';

interface AuthKitButtonProps {
  onSuccess?: (connection: any) => void;
  onError?: (error: any) => void;
  className?: string;
  children?: React.ReactNode;
}

export function AuthKitButton({ 
  onSuccess, 
  onError, 
  className,
  children 
}: AuthKitButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const { open } = useAuthKit({
    token: {
      url: `${import.meta.env.VITE_SUPABASE_URL || ''}/functions/v1/authkit-token`,
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
    },
    onSuccess: (connection) => {
      console.log("Connected:", connection);
      setIsConnecting(false);
      onSuccess?.(connection);
    },
    onError: (error) => {
      console.error("AuthKit error:", error);
      setIsConnecting(false);
      onError?.(error);
    },
    onClose: () => {
      console.log("AuthKit UI closed");
      setIsConnecting(false);
    },
  });

  const handleConnect = () => {
    setIsConnecting(true);
    open();
  };

  return (
    <Button 
      onClick={handleConnect} 
      disabled={isConnecting}
      className={`transition-all duration-300 transform hover:scale-105 ${className}`}
    >
      {isConnecting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <PlusCircle className="mr-2 h-4 w-4" />
      )}
      {children || 'Connect Tools'}
    </Button>
  );
}