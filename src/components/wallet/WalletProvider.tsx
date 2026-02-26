/**
 * IiteBCH - Wallet Provider (Fixed with localStorage persistence)
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface BchWallet {
  cashAddress: string;
  tokenAddress: string;
  publicKey?: string;
}

export interface WalletContextType {
  wallet: BchWallet | null;
  walletType: 'paytaca' | 'cashonize' | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  connectWalletConnect: (address: string) => void;
  connectCashonize: (address: string) => void;
  openCashonizeWeb: () => void;
  openPaytacaExtension: () => void;
  disconnect: () => void;
  signTransaction: (txHex: string) => Promise<string>;
  getPublicKey: () => Promise<string>;
  isInstalled: boolean;
}

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

const WalletContext = createContext<WalletContextType | null>(null);
const STORAGE_KEY = 'IITEBCH_wallet';

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<BchWallet | null>(null);
  const [walletType, setWalletType] = useState<'paytaca' | 'cashonize' | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

  // Check if wallet extension installed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsInstalled(!!window.bitcoin);
    }
  }, []);

  // Restore wallet from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.cashAddress) {
          setWallet(parsed.wallet || parsed);
          setWalletType(parsed.walletType || 'paytaca');
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsRestored(true);
  }, []);

  // Save wallet to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (wallet) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ wallet, walletType }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [wallet, walletType]);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined') {
      setError('Cannot connect');
      return;
    }

    if (!window.bitcoin) {
      setError('Install Paytaca extension');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.bitcoin.requestAccounts();
      if (!accounts?.length) throw new Error('No accounts');

      const cashAddress = accounts[0];
      let publicKey: string | undefined;
      try {
        publicKey = await window.bitcoin.getPublicKey();
      } catch { }

      const newWallet: BchWallet = {
        cashAddress,
        tokenAddress: cashAddress,
        publicKey,
      };

      setWallet(newWallet);
      setWalletType('paytaca');
    } catch (err: any) {
      setError(err.message || 'Connection failed');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connectWalletConnect = useCallback((address: string) => {
    setWallet({ cashAddress: address, tokenAddress: address, publicKey: undefined });
    setWalletType('paytaca');
  }, []);

  const connectCashonize = useCallback((address: string) => {
    setWallet({ cashAddress: address, tokenAddress: address, publicKey: undefined });
    setWalletType('cashonize');
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
    setWalletType(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const signTransaction = useCallback(async (txHex: string): Promise<string> => {
    if (!window.bitcoin) throw new Error('Wallet not available');
    return window.bitcoin.signTransaction(txHex);
  }, []);

  const getPublicKey = useCallback(async (): Promise<string> => {
    if (!window.bitcoin) throw new Error('Wallet not available');
    return window.bitcoin.getPublicKey();
  }, []);

  const openCashonizeWeb = useCallback(() => {
    window.open('https://cashonize.com/', '_blank');
  }, []);

  const openPaytacaExtension = useCallback(() => {
    window.open('https://chromewebstore.google.com/detail/paytaca', '_blank');
  }, []);

  const value = React.useMemo(() => ({
    wallet,
    walletType,
    isConnected: !!wallet,
    isConnecting,
    error,
    connect,
    connectWalletConnect,
    connectCashonize,
    openCashonizeWeb,
    openPaytacaExtension,
    disconnect,
    signTransaction,
    getPublicKey,
    isInstalled,
  }), [wallet, walletType, isConnecting, error, connect, connectWalletConnect, connectCashonize, openCashonizeWeb, openPaytacaExtension, disconnect, signTransaction, getPublicKey, isInstalled]);

  // Don't render until restored from localStorage
  if (!isRestored) return null;

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useIsWalletInstalled() {
  const [isInstalled, setIsInstalled] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') setIsInstalled(!!window.bitcoin);
  }, []);
  return isInstalled;
}

export function formatAddress(address: string, chars = 6): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + (address.includes(':') ? address.indexOf(':') + 1 : 0))}...${address.slice(-chars)}`;
}
