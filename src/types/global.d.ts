interface Window {
  grecaptcha?: {
    enterprise?: {
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  };
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    isMetaMask?: boolean;
    selectedAddress?: string;
    on?: (event: string, callback: (accounts: string[]) => void) => void;
    removeListener?: (event: string, callback: (accounts: string[]) => void) => void;
  };
  web3?: any;
}