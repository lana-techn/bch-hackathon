/**
 * Web3 Comments Component
 * 
 * Uses Gun.js for real-time P2P comments
 */

'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/components/wallet';
import { useTokenComments } from '@/hooks/useWeb3Database';
import { formatAddress } from '@/components/wallet';

interface Web3CommentsProps {
  tokenId: string;
}

export function Web3Comments({ tokenId }: Web3CommentsProps) {
  const { wallet, isConnected } = useWallet();
  const { comments, loading, error, addComment } = useTokenComments(tokenId);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !wallet || !newComment.trim()) return;

    setIsSubmitting(true);
    const success = await addComment(newComment.trim(), wallet.cashAddress);
    if (success) {
      setNewComment('');
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin h-6 w-6 border-2 border-neon border-t-transparent rounded-full mx-auto" />
        <p className="text-text-dim text-sm mt-2">Loading comments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-panic-red bg-panic-red/10">
        <p className="text-panic-red text-sm">Error loading comments: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-text font-[family-name:var(--font-heading)] uppercase">
        Community Discussion
      </h3>

      {/* Comment Form */}
      {isConnected ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this token..."
            className="w-full bg-void border-2 border-border p-3 text-text placeholder-text-dim focus:border-neon focus:outline-none resize-none h-24"
            maxLength={500}
          />
          <div className="flex justify-between items-center">
            <span className="text-text-dim text-xs">{newComment.length}/500</span>
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="brutal-btn bg-neon text-void font-bold px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 border border-dashed border-border text-center">
          <p className="text-text-dim text-sm">Connect your wallet to join the discussion</p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-text-dim text-center py-8">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border border-border p-3 bg-void/50">
              <div className="flex justify-between items-start mb-2">
                <span className="text-neon font-mono text-xs">
                  {formatAddress(comment.authorAddress)}
                </span>
                <span className="text-text-dim text-xs">
                  {new Date(comment.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-text text-sm">{comment.content}</p>
              <div className="mt-2 flex items-center gap-4 text-xs text-text-dim">
                <button className="hover:text-neon flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {comment.likes || 0}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
