/**
 * IgniteBCH - WalletConnect Hook
 *
 * Hook untuk connect ke wallet via WalletConnect v2 (BCH WalletConnect spec)
 * Digunakan oleh Cashonize dan wallet mobile lainnya
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import SignClient from '@walletconnect/sign-client';

// BCH WalletConnect namespace
const BCH_NAMESPACE = 'bch';
const BCH_METHODS = [
  'bch_signTransaction',
  'bch_signMessage',
  'bch_getAddresses',
];
const BCH_CHAINS = [
  'bch:mainnet',
  'bch:chipnet', 
];

interface WalletConnectState {
  client: SignClient | null;
  uri: string | null;
  session: any | null;
  isConnecting: boolean;
  error: string | null;
}

export function useWalletConnect() {
  const [state, setState] = useState<WalletConnectState>({
    client: null,
    uri: null,
    session: null,
    isConnecting: false,
    error: null,
  });
  
  const clientRef = useRef<SignClient | null>(null);

  // Initialize WalletConnect client
  const initClient = useCallback(async () => {
    if (clientRef.current) return clientRef.current;

    try {
      const client = await SignClient.init({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
        metadata: {
          name: 'IgniteBCH',
          description: 'Fair Launch Protocol on Bitcoin Cash',
          url: typeof window !== 'undefined' ? window.location.origin : 'https://ignitebch.com',
          icons: ['https://ignitebch.com/icon.png'],
        },
      });

      clientRef.current = client;
      
      // Listen for session events
      (client as any).on('session_proposal', (event: any) => {
        console.log('Session proposal:', event);
      });

      (client as any).on('session_created', (event: any) => {
        console.log('Session created:', event);
        setState(prev => ({ ...prev, session: event.session, isConnecting: false }));
      });

      (client as any).on('session_update', (event: any) => {
        console.log('Session updated:', event);
        setState(prev => ({ ...prev, session: event.session }));
      });

      (client as any).on('session_delete', () => {
        console.log('Session deleted');
        setState(prev => ({ ...prev, session: null }));
      });

      return client;
    } catch (err) {
      console.error('Failed to init WalletConnect:', err);
      setState(prev => ({ ...prev, error: 'Failed to initialize WalletConnect' }));
      return null;
    }
  }, []);

  // Connect to wallet
  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true, error: null, uri: null }));

    try {
      const client = await initClient();
      if (!client) throw new Error('WalletConnect client not initialized');

      const { uri, approval } = await client.connect({
        requiredNamespaces: {
          [BCH_NAMESPACE]: {
            methods: BCH_METHODS,
            chains: BCH_CHAINS,
            events: ['accountsChanged', 'chainChanged'],
          },
        },
      });

      if (uri) {
        setState(prev => ({ ...prev, uri }));
      }

      // Wait for approval
      const session = await approval();
      setState(prev => ({ ...prev, session, isConnecting: false, uri: null }));
      
      return session;
    } catch (err) {
      console.error('Connection error:', err);
      setState(prev => ({ 
        ...prev, 
        isConnecting: false, 
        error: err instanceof Error ? err.message : 'Connection failed' 
      }));
      throw err;
    }
  }, [initClient]);

  // Disconnect
  const disconnect = useCallback(async () => {
    try {
      if (clientRef.current && state.session) {
        await clientRef.current.disconnect({
          topic: state.session.topic,
          reason: { code: 6000, message: 'User disconnected' },
        });
      }
    } catch (err) {
      console.error('Disconnect error:', err);
    } finally {
      setState(prev => ({ ...prev, session: null, uri: null }));
    }
  }, [state.session]);

  // Sign transaction
  const signTransaction = useCallback(async (txHex: string): Promise<string> => {
    if (!clientRef.current || !state.session) {
      throw new Error('No active session');
    }

    const result = await clientRef.current.request({
      topic: state.session.topic,
      chainId: 'bch:mainnet',
      request: {
        method: 'bch_signTransaction',
        params: {
          transaction: txHex,
        },
      },
    });

    return result as string;
  }, [state.session]);

  // Get connected address
  const getAddress = useCallback((): string | null => {
    if (!state.session) return null;
    
    const accounts = state.session.namespaces?.bch?.accounts || [];
    if (accounts.length > 0) {
      // Format: "bch:mainnet:address" -> extract address
      const parts = accounts[0].split(':');
      return parts.length >= 3 ? parts.slice(2).join(':') : accounts[0];
    }
    return null;
  }, [state.session]);

  return {
    ...state,
    connect,
    disconnect,
    signTransaction,
    getAddress,
    uri: state.uri,
    isConnected: !!state.session,
    address: getAddress(),
  };
}

export type { WalletConnectState };
