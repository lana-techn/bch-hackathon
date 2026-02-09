/**
 * IgniteBCH - Wallet Provider
 *
 * React Context untuk wallet BCH
 * 
 * Primary: Paytaca Extension (Chrome Web Store)
 * Fallback: Cashonize Web Wallet (https://cashonize.com/)
 * 
 * Keduanya menggunakan window.bitcoin API standard
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface BchWallet {
  cashAddress: string;
  tokenAddress: string;
  publicKey?: string;
}

export interface WalletContextType {
  wallet: BchWallet | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  openCashonizeWeb: () => void;
  openPaytacaExtension: () => void;
  disconnect: () => void;
  signTransaction: (txHex: string) => Promise<string>;
  getPublicKey: () => Promise<string>;
  isInstalled: boolean;
}

// Window.bitcoin API interface
interface WindowBitcoin {
  requestAccounts: () => Promise<string[]>;
  getPublicKey: () => Promise<string>;
  signTransaction: (txHex: string) => Promise<string>;
  signMessage: (message: string) => Promise<string>;
}

declare global {
  interface Window {
    bitcoin?: WindowBitcoin;
  }
}

// =============================================================================
// Context
// =============================================================================

const WalletContext = createContext<WalletContextType | null>(null);

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// =============================================================================
// Provider
// =============================================================================

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [wallet, setWallet] = useState<BchWallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Check if window.bitcoin is available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsInstalled(!!window.bitcoin);
    }
  }, []);

  // Try to restore connection on mount
  useEffect(() => {
    const restoreConnection = async () => {
      if (typeof window === 'undefined' || !window.bitcoin) return;

      try {
        // Check if wallet is still authorized by requesting accounts
        // This won't show popup if already connected
        const accounts = await window.bitcoin.requestAccounts();
        if (accounts && accounts.length > 0) {
          const cashAddress = accounts[0];
          // Derive token address from cash address
          const tokenAddress = cashAddress;

          // Try to get public key
          let publicKey: string | undefined;
          try {
            publicKey = await window.bitcoin.getPublicKey();
          } catch {
            // Public key might not be available
          }

          setWallet({
            cashAddress,
            tokenAddress,
            publicKey,
          });
        }
      } catch {
        // Not connected or user rejected
      }
    };

    restoreConnection();
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined') {
      setError('Cannot connect: window is undefined');
      return;
    }

    if (!window.bitcoin) {
      setError('No BCH wallet detected. Please install Paytaca extension.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.bitcoin.requestAccounts();

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from wallet');
      }

      const cashAddress = accounts[0];
      const tokenAddress = cashAddress;

      // Try to get public key
      let publicKey: string | undefined;
      try {
        publicKey = await window.bitcoin.getPublicKey();
      } catch {
        // Some wallets don't support getPublicKey
      }

      setWallet({
        cashAddress,
        tokenAddress,
        publicKey,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const openCashonizeWeb = useCallback(() => {
    // Open Cashonize web wallet in a new tab
    window.open('https://cashonize.com/', '_blank', 'noopener,noreferrer');
  }, []);

  const openPaytacaExtension = useCallback(() => {
    // Open Paytaca Chrome Web Store page
    window.open('https://chromewebstore.google.com/detail/paytaca/paytaca', '_blank', 'noopener,noreferrer');
  }, []);

  const disconnect = useCallback(() => {
    // window.bitcoin doesn't have a disconnect method
    // Just clear our local state
    setWallet(null);
    setError(null);
  }, []);

  const signTransaction = useCallback(async (txHex: string): Promise<string> => {
    if (!window.bitcoin) {
      throw new Error('Wallet not available');
    }
    return window.bitcoin.signTransaction(txHex);
  }, []);

  const getPublicKey = useCallback(async (): Promise<string> => {
    if (!window.bitcoin) {
      throw new Error('Wallet not available');
    }
    return window.bitcoin.getPublicKey();
  }, []);

  // Check for wallet installation on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (typeof window !== 'undefined') {
        setIsInstalled(!!window.bitcoin);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const value: WalletContextType = {
    wallet,
    isConnected: !!wallet,
    isConnecting,
    error,
    connect,
    openCashonizeWeb,
    openPaytacaExtension,
    disconnect,
    signTransaction,
    getPublicKey,
    isInstalled,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// =============================================================================
// Utility Hooks
// =============================================================================

export function useIsWalletInstalled() {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsInstalled(!!window.bitcoin);
    }
  }, []);

  return isInstalled;
}

export function formatAddress(address: string, chars = 6): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + (address.includes(':') ? address.indexOf(':') + 1 : 0))}...${address.slice(-chars)}`;
}
