'use client';

import Link from "next/link";
import { useState } from "react";
import { useWallet, formatAddress, WalletConnectModal } from "@/components/wallet";

export function Navbar() {
  const { isConnected, isConnecting, wallet, connect, disconnect, isInstalled } = useWallet();
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showWalletConnect, setShowWalletConnect] = useState(false);

  const handleConnect = async () => {
    if (isInstalled) {
      // Try window.bitcoin first (Paytaca extension)
      try {
        await connect();
      } catch {
        // If failed, show wallet options
        setShowWalletOptions(true);
      }
    } else {
      // Show wallet options modal/dropdown
      setShowWalletOptions(true);
    }
  };

  const handlePaytacaClick = () => {
    if (isInstalled) {
      // Connect via window.bitcoin
      connect();
    } else {
      // Open Chrome Web Store
      window.open('https://chromewebstore.google.com/detail/paytaca/paytaca', '_blank');
    }
    setShowWalletOptions(false);
  };

  const handleCashonizeClick = () => {
    // Open WalletConnect modal
    setShowWalletConnect(true);
    setShowWalletOptions(false);
  };

  // Not connected - show connect button with wallet options
  if (!isConnected) {
    return (
      <>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-void border-b-3 border-border h-16 flex items-center px-4 md:px-8">
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-neon brutal-shadow flex items-center justify-center">
                <span className="text-void font-bold text-lg font-[family-name:var(--font-heading)]">
                  I
                </span>
              </div>
              <span className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase tracking-wider text-text group-hover:text-neon transition-colors">
                Ignite<span className="text-neon">BCH</span>
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="font-[family-name:var(--font-heading)] text-sm uppercase tracking-wider text-text-dim hover:text-neon transition-colors"
              >
                Tokens
              </Link>
              <Link
                href="/create"
                className="font-[family-name:var(--font-heading)] text-sm uppercase tracking-wider text-text-dim hover:text-neon transition-colors"
              >
                Launch
              </Link>
              <a
                href="#"
                className="font-[family-name:var(--font-heading)] text-sm uppercase tracking-wider text-text-dim hover:text-neon transition-colors"
              >
                Docs
              </a>
            </div>

            {/* Connect Wallet Section */}
            <div className="relative">
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="brutal-btn bg-neon text-void font-[family-name:var(--font-heading)] font-bold text-sm uppercase tracking-wider px-5 py-2 border-3 border-neon hover:bg-void hover:text-neon transition-colors disabled:opacity-50"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>

              {/* Wallet Options Dropdown */}
              {showWalletOptions && (
                <>
                  <div className="absolute right-0 top-full mt-2 w-72 bg-void border-3 border-neon z-50 shadow-[4px_4px_0px_0px_rgba(0,255,163,0.3)]">
                    <div className="p-4 border-b border-neon/30">
                      <p className="text-terminal-green font-mono text-xs uppercase mb-1">Choose Wallet</p>
                      <p className="text-text-dim font-mono text-xs">Connect your BCH wallet</p>
                    </div>

                    <div className="p-3 space-y-2">
                      {/* Paytaca - Primary Option */}
                      <button
                        onClick={handlePaytacaClick}
                        className="w-full text-left p-3 bg-neon/5 border border-neon/30 hover:border-neon hover:bg-neon/10 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-neon/20 flex items-center justify-center">
                            <span className="text-neon font-bold text-lg">P</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-neon font-mono text-sm font-bold group-hover:text-terminal-green">
                              {isInstalled ? 'Paytaca (Extension)' : 'Install Paytaca'}
                            </p>
                            <p className="text-text-dim font-mono text-xs">
                              {isInstalled ? 'Connect via browser extension' : 'Chrome Extension'}
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* Cashonize - WalletConnect Option */}
                      <button
                        onClick={handleCashonizeClick}
                        className="w-full text-left p-3 bg-void border border-border hover:border-neon/50 hover:bg-neon/5 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-border flex items-center justify-center">
                            <span className="text-text-dim font-bold text-lg group-hover:text-neon">C</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-text font-mono text-sm font-bold group-hover:text-neon">Cashonize</p>
                            <p className="text-text-dim font-mono text-xs">Via WalletConnect</p>
                          </div>
                        </div>
                      </button>
                    </div>

                    <div className="p-3 border-t border-neon/30">
                      <p className="text-text-dim font-mono text-xs text-center">
                        Both support CashTokens
                      </p>
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
          </div>
        </nav>

        {/* WalletConnect Modal */}
        <WalletConnectModal 
          isOpen={showWalletConnect} 
          onClose={() => setShowWalletConnect(false)}
        />
      </>
    );
  }

  // Connected - show address button with dropdown
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-void border-b-3 border-border h-16 flex items-center px-4 md:px-8">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-neon brutal-shadow flex items-center justify-center">
            <span className="text-void font-bold text-lg font-[family-name:var(--font-heading)]">
              I
            </span>
          </div>
          <span className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase tracking-wider text-text group-hover:text-neon transition-colors">
            Ignite<span className="text-neon">BCH</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="font-[family-name:var(--font-heading)] text-sm uppercase tracking-wider text-text-dim hover:text-neon transition-colors"
          >
            Tokens
          </Link>
          <Link
            href="/create"
            className="font-[family-name:var(--font-heading)] text-sm uppercase tracking-wider text-text-dim hover:text-neon transition-colors"
          >
            Launch
          </Link>
          <a
            href="#"
            className="font-[family-name:var(--font-heading)] text-sm uppercase tracking-wider text-text-dim hover:text-neon transition-colors"
          >
            Docs
          </a>
        </div>

        {/* Connected Wallet Button with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="brutal-btn bg-void text-neon font-[family-name:var(--font-heading)] font-bold text-sm uppercase tracking-wider px-5 py-2 border-3 border-neon hover:bg-neon hover:text-void transition-colors flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
            {formatAddress(wallet!.cashAddress)}
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              <div className="absolute right-0 top-full mt-2 w-64 bg-void border-3 border-neon z-50 shadow-[4px_4px_0px_0px_rgba(0,255,163,0.3)]">
                <div className="p-4 border-b border-neon/30">
                  <p className="text-text-dim text-xs uppercase font-mono mb-1">Connected</p>
                  <p className="text-neon font-mono text-xs break-all">
                    {wallet!.cashAddress}
                  </p>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(wallet!.cashAddress);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-text-dim font-mono text-sm hover:text-neon hover:bg-neon/10 transition-colors flex items-center gap-2"
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
                    className="w-full text-left px-3 py-2 text-text-dim font-mono text-sm hover:text-neon hover:bg-neon/10 transition-colors flex items-center gap-2"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View on Explorer
                  </a>

                  <div className="border-t border-neon/30 my-1" />

                  <button
                    onClick={() => {
                      disconnect();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-panic-red font-mono text-sm hover:bg-panic-red/10 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Disconnect
                  </button>
                </div>
              </div>
              {/* Click outside to close */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
