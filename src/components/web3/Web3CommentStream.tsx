/**
 * Web3 Comment Stream Component
 * 
 * Replaces the mock CommentStream with real Gun.js comments
 */

'use client';

import { Web3Comments, Web3LikeButton } from '@/components/web3';

interface Web3CommentStreamProps {
  tokenId: string;
}

export function Web3CommentStream({ tokenId }: Web3CommentStreamProps) {
  return (
    <div className="bg-card border-3 border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-[family-name:var(--font-heading)] text-sm uppercase text-text">
          Community
        </h3>
        <Web3LikeButton tokenId={tokenId} />
      </div>
      <Web3Comments tokenId={tokenId} />
    </div>
  );
}
