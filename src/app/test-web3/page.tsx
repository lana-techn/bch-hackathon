/**
 * Web3 Features Test Page
 * 
 * Demonstrates:
 * - IPFS file upload
 * - Gun.js comments
 * - Gun.js likes
 * - Real-time P2P sync
 */

'use client';

import { useState } from 'react';
import { useWallet } from '@/components/wallet';
import { useIPFSUpload } from '@/hooks/useIPFS';
import { Web3Comments, Web3LikeButton } from '@/components/web3';
import { isIPFSConfigured } from '@/lib/ipfs';

export default function Web3TestPage() {
  const { wallet, isConnected } = useWallet();
  const { upload, isUploading, progress, error: uploadError, result } = useIPFSUpload();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const tokenId = 'be99ca4cf589b01558f241024040dfce37cdbcf1ab1a4de99d4b0f75409289b9';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await upload(selectedFile, {
      name: `token-image-${Date.now()}`,
      metadata: {
        tokenId,
        uploader: wallet?.cashAddress || 'anonymous',
      },
    });
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen bg-void p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-text font-[family-name:var(--font-heading)] uppercase">
          Web3 Features Test
        </h1>

        {/* Wallet Status */}
        <div className="border-2 border-border p-4">
          <h2 className="text-lg font-bold text-neon mb-2">Wallet Status</h2>
          {isConnected ? (
            <p className="text-text">
              Connected: <span className="font-mono text-neon">{wallet?.cashAddress}</span>
            </p>
          ) : (
            <p className="text-panic-red">Not connected. Please connect your wallet.</p>
          )}
        </div>

        {/* IPFS Upload Test */}
        <div className="border-2 border-border p-4">
          <h2 className="text-lg font-bold text-neon mb-4">IPFS Upload Test</h2>
          
          {!isIPFSConfigured() && (
            <p className="text-panic-red text-sm mb-4">
              ⚠️ Pinata not configured. Add NEXT_PUBLIC_PINATA_JWT to .env.local
            </p>
          )}

          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-text-dim file:mr-4 file:py-2 file:px-4 file:border-2 file:border-neon file:text-sm file:font-bold file:bg-neon file:text-void hover:file:bg-void hover:file:text-neon"
            />
            
            {selectedFile && (
              <div className="text-sm text-text-dim">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || !isIPFSConfigured()}
              className="brutal-btn bg-neon text-void font-bold px-4 py-2 disabled:opacity-50"
            >
              {isUploading ? `Uploading... ${progress}%` : 'Upload to IPFS'}
            </button>

            {uploadError && (
              <p className="text-panic-red text-sm">Error: {uploadError}</p>
            )}

            {result?.success && (
              <div className="p-4 border border-neon bg-neon/5">
                <p className="text-neon font-bold mb-2">Upload Successful!</p>
                <p className="text-xs text-text-dim break-all">CID: {result.cid}</p>
                <a
                  href={result.gatewayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neon text-sm hover:underline block mt-2"
                >
                  View on IPFS Gateway →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Gun.js Likes Test */}
        <div className="border-2 border-border p-4">
          <h2 className="text-lg font-bold text-neon mb-4">Gun.js Likes Test</h2>
          <Web3LikeButton tokenId={tokenId} />
          <p className="text-text-dim text-sm mt-2">
            This uses Gun.js P2P database. Likes sync in real-time across all users!
          </p>
        </div>

        {/* Gun.js Comments Test */}
        <div className="border-2 border-border p-4">
          <h2 className="text-lg font-bold text-neon mb-4">Gun.js Comments Test</h2>
          <Web3Comments tokenId={tokenId} />
          <p className="text-text-dim text-sm mt-4">
            Comments are stored in the decentralized Gun.js network and sync in real-time!
          </p>
        </div>

        {/* Info */}
        <div className="border border-border p-4 bg-void/50">
          <h3 className="text-sm font-bold text-text mb-2">About Web3 Features</h3>
          <ul className="text-xs text-text-dim space-y-1">
            <li>• <strong>IPFS:</strong> Decentralized file storage via Pinata</li>
            <li>• <strong>Gun.js:</strong> P2P graph database for real-time sync</li>
            <li>• <strong>Blockchain:</strong> Source of truth for token ownership & trades</li>
            <li>• Token ID: <span className="font-mono text-neon">{tokenId}</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
