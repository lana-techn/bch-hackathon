/**
 * IiteBCH - WalletConnect Modal
 *
 * Modal untuk menampilkan QR code dan URI untuk WalletConnect
 */

'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useWalletConnect } from '@/hooks/useWalletConnect';
import { useEffect } from 'react';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (address: string) => void;
}

export function WalletConnectModal({ isOpen, onClose, onConnect }: WalletConnectModalProps) {
  const { connect, uri, isConnecting, isConnected, address, error } = useWalletConnect();

  useEffect(() => {
    if (isOpen && !uri && !isConnecting && !isConnected) {
      connect();
    }
  }, [isOpen, uri, isConnecting, isConnected, connect]);

  useEffect(() => {
    if (isConnected && address && onConnect) {
      onConnect(address);
    }
  }, [isConnected, address, onConnect]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/90">
      <div className="bg-void-black border-3 border-terminal-green p-8 max-w-md w-full mx-4 shadow-[8px_8px_0px_0px_#00FFA3]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-terminal-green font-[family-name:var(--font-heading)] text-xl uppercase tracking-wider">
            Connect Wallet
          </h2>
          <button
            onClick={onClose}
            className="text-gray hover:text-panic-red transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isConnecting && !uri && (
          <div className="text-center py-8">
            <div className="inline-block w-12 h-12 border-3 border-terminal-green border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-text font-mono">Initializing WalletConnect...</p>
          </div>
        )}

        {uri && !isConnected && (
          <div className="text-center">
            <p className="text-text font-mono text-sm mb-4">
              Scan this QR code with your wallet app
            </p>
            
            <div className="bg-white p-4 inline-block mb-4">
              <QRCodeSVG value={uri} size={240} />
            </div>

            <div className="mt-4">
              <p className="text-gray font-mono text-xs mb-2">Or copy this URI:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={uri}
                  readOnly
                  className="flex-1 bg-void border border-gray text-text font-mono text-xs p-2 truncate"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(uri)}
                  className="px-4 py-2 bg-terminal-green text-void-black font-mono text-xs uppercase font-bold hover:bg-terminal-green/80 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 border border-gray/30">
              <p className="text-gray font-mono text-xs mb-2">Supported Wallets:</p>
              <ul className="text-text font-mono text-xs space-y-1">
                <li>• Cashonize (Web/Mobile)</li>
                <li>• Paytaca (Mobile)</li>
                <li>• Any WalletConnect-compatible BCH wallet</li>
              </ul>
            </div>
          </div>
        )}

        {isConnected && address && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-terminal-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-terminal-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-terminal-green font-mono text-lg mb-2">Connected!</p>
            <p className="text-text font-mono text-sm break-all">{address}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-panic-red/10 border border-panic-red">
            <p className="text-panic-red font-mono text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
