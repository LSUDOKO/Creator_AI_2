interface Window {
  grecaptcha?: {
    enterprise?: {
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  };
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<unknown>;
  };
  web3?: any;
}

declare module 'flubber';