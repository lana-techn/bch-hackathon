/**
 * IiteBCH - Connect Wallet Button
 *
 * Button untuk connect wallet dengan style Toxic Ledger (neo-brutalist).
 * Support Paytaca Extension & Cashonize Web Wallet
 */

'use client';

import { useState } from 'react';
import { useWallet, formatAddress } from './WalletProvider';

export function ConnectWalletButton() {
  const { isConnected, isConnecting, wallet, connect, disconnect, isInstalled, openCashonizeWeb, openPaytacaExtension } = useWallet();
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleConnect = async () => {
    if (isInstalled) {
      try {
        await connect();
      } catch {
        // Error handled by provider
      }
    } else {
      setShowWalletOptions(true);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  // Not connected - show connect button with wallet options
  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="relative px-5 py-2.5 bg-terminal-green text-void-black font-mono text-sm uppercase tracking-wider font-bold border-2 border-terminal-green hover:bg-transparent hover:text-terminal-green transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 95% 100%, 0 100%)' }}
        >
          {isConnecting ? (
            <span className="flex items-center gap-2">
              <span className="animate-pulse">Connecting</span>
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            </span>
          ) : (
            'Connect Wallet'
          )}
        </button>

        {/* Wallet Options Dropdown */}
        {showWalletOptions && (
          <>
            <div className="absolute right-0 top-full mt-2 w-72 bg-void-black border-2 border-terminal-green z-50 shadow-[4px_4px_0px_0px_#00FFA3]">
              <div className="p-4 border-b border-terminal-green/30">
                <p className="text-terminal-green font-mono text-xs uppercase mb-1">Choose Wallet</p>
                <p className="text-gray font-mono text-xs">Connect your BCH wallet</p>
              </div>

              <div className="p-3 space-y-2">
                {/* Paytaca - Primary Option */}
                <button
                  onClick={() => {
                    openPaytacaExtension();
                    setShowWalletOptions(false);
                  }}
                  className="w-full text-left p-3 bg-terminal-green/5 border border-terminal-green/30 hover:border-terminal-green hover:bg-terminal-green/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-terminal-green/20 flex items-center justify-center">
                      <span className="text-terminal-green font-bold text-lg">P</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-terminal-green font-mono text-sm font-bold">Paytaca</p>
                      <p className="text-gray font-mono text-xs">Extension (Recommended)</p>
                    </div>
                  </div>
                </button>

                {/* Cashonize - Web Option */}
                <button
                  onClick={() => {
                    openCashonizeWeb();
                    setShowWalletOptions(false);
                  }}
                  className="w-full text-left p-3 border border-gray hover:border-terminal-green/50 hover:bg-terminal-green/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray flex items-center justify-center">
                      <span className="text-text font-bold text-lg">C</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-text font-mono text-sm font-bold">Cashonize</p>
                      <p className="text-gray font-mono text-xs">Web Wallet</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            {/* Click outside to close */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowWalletOptions(false)}
            />
          </>
        )}
      </div>
    );
  }

  // Connected - show address with dropdown
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative px-4 py-2.5 bg-void-black text-terminal-green font-mono text-sm uppercase tracking-wider font-bold border-2 border-terminal-green hover:bg-terminal-green hover:text-void-black transition-all duration-75 flex items-center gap-3"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 95% 100%, 0 100%)' }}
      >
        <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
        <span>{formatAddress(wallet!.cashAddress)}</span>
        <svg
          className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-void-black border-2 border-terminal-green z-50 shadow-[4px_4px_0px_0px_#00FFA3]">
          <div className="p-4 border-b border-terminal-green/30">
            <p className="text-gray text-xs uppercase font-mono mb-1">Connected</p>
            <p className="text-terminal-green font-mono text-xs break-all">
              {wallet!.cashAddress}
            </p>
          </div>

          <div className="p-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(wallet!.cashAddress);
                setShowDropdown(false);
              }}
              className="w-full text-left px-3 py-2 text-gray font-mono text-sm hover:text-terminal-green hover:bg-terminal-green/10 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a-2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Address
            </button>

            <a
              href={`https://blockchair.com/bitcoin-cash/address/${wallet!.cashAddress.replace('bitcoincash:', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left px-3 py-2 text-gray font-mono text-sm hover:text-terminal-green hover:bg-terminal-green/10 transition-colors flex items-center gap-2"
              onClick={() => setShowDropdown(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View on Explorer
            </a>

            <div className="border-t border-terminal-green/30 my-1" />

            <button
              onClick={handleDisconnect}
              className="w-full text-left px-3 py-2 text-panic-red font-mono text-sm hover:bg-panic-red/10 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
