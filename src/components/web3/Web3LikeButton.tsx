/**
 * Web3 Like Button Component
 * 
 * Uses Gun.js for decentralized likes
 */

'use client';

import { useTokenLikes } from '@/hooks/useWeb3Database';
import { useWallet } from '@/components/wallet';

interface Web3LikeButtonProps {
  tokenId: string;
}

export function Web3LikeButton({ tokenId }: Web3LikeButtonProps) {
  const { wallet, isConnected } = useWallet();
  const { likes, hasLiked, loading, toggleLike } = useTokenLikes(
    tokenId,
    wallet?.cashAddress
  );

  const handleClick = async () => {
    if (!isConnected) return;
    await toggleLike();
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isConnected || loading}
      className={`flex items-center gap-2 px-4 py-2 border-2 font-bold text-sm transition-colors ${
        hasLiked
          ? 'bg-panic-red border-panic-red text-white'
          : 'border-border text-text-dim hover:border-neon hover:text-neon'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <svg
        className="w-5 h-5"
        fill={hasLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{loading ? '...' : likes}</span>
      {!isConnected && <span className="text-xs">(Connect to like)</span>}
    </button>
  );
}
