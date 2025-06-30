// Web3 wallet connection utilities
export interface WalletConnectionDetails {
  isConnected: boolean
  address: string | null
}

export interface Web3WalletProvider {
  name: string
  icon: string
  isInstalled: boolean
}

export const getWalletConnectionDetails = (): WalletConnectionDetails => {
  try {
    const address = localStorage.getItem('wallet_address')
    const signature = localStorage.getItem('wallet_signature')
    
    return {
      isConnected: !!(address && signature),
      address: address || null,
    }
  } catch (error) {
    console.error('Error getting wallet connection details:', error)
    return {
      isConnected: false,
      address: null,
    }
  }
}

export const setWalletConnection = (address: string, signature: string) => {
  try {
    localStorage.setItem('wallet_address', address.toLowerCase())
    localStorage.setItem('wallet_signature', signature)
    localStorage.setItem('wallet_message', `Sign this message to authenticate: ${Date.now()}`)
  } catch (error) {
    console.error('Error setting wallet connection:', error)
  }
}

export const clearWalletConnection = () => {
  try {
    localStorage.removeItem('wallet_address')
    localStorage.removeItem('wallet_signature')
    localStorage.removeItem('wallet_message')
  } catch (error) {
    console.error('Error clearing wallet connection:', error)
  }
}

export const isWeb3Supported = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
}

export const getAvailableWallets = (): Web3WalletProvider[] => {
  const wallets: Web3WalletProvider[] = []
  
  if (typeof window !== 'undefined') {
    if (window.ethereum?.isMetaMask) {
      wallets.push({
        name: 'MetaMask',
        icon: '🦊',
        isInstalled: true
      })
    }
    
    if (window.ethereum && !window.ethereum.isMetaMask) {
      wallets.push({
        name: 'Web3 Wallet',
        icon: '🔗',
        isInstalled: true
      })
    }
  }
  
  if (wallets.length === 0) {
    wallets.push({
      name: 'MetaMask',
      icon: '🦊',
      isInstalled: false
    })
  }
  
  return wallets
}

export const formatWalletAddress = (address: string): string => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const connectWallet = async (): Promise<{ address: string; signature: string }> => {
  if (!isWeb3Supported()) {
    throw new Error('Web3 wallet not supported or not installed')
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found')
    }

    const address = accounts[0]
    const message = `Sign this message to authenticate: ${Date.now()}`
    
    // Request signature
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address]
    })

    return { address, signature }
  } catch (error) {
    console.error('Error connecting wallet:', error)
    throw error
  }
}

export const authenticateWithWallet = async (address: string, signature: string): Promise<boolean> => {
  try {
    // Store the wallet connection
    setWalletConnection(address, signature)
    return true
  } catch (error) {
    console.error('Error authenticating with wallet:', error)
    return false
  }
}

export const storeWalletConnection = (address: string, signature: string): void => {
  setWalletConnection(address, signature)
}

export const disconnectWallet = (): void => {
  clearWalletConnection()
}

export const getConnectedWallet = (): WalletConnectionDetails => {
  return getWalletConnectionDetails()
}

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<any>
    }
  }
}