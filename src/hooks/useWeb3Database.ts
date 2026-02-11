'use client';

import { useState, useEffect, useCallback } from 'react';
import Web3Database, { TokenMetadata, TokenComment, UserProfile } from '@/lib/web3';

// Hook for token metadata
export function useTokenMetadata(tokenId: string) {
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    Web3Database.getTokenMetadata(tokenId)
      .then((data) => {
        setMetadata(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [tokenId]);

  const saveMetadata = useCallback(async (data: TokenMetadata) => {
    try {
      await Web3Database.saveTokenMetadata(data);
      setMetadata(data);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, []);

  return { metadata, loading, error, saveMetadata };
}

// Hook for token comments
export function useTokenComments(tokenId: string) {
  const [comments, setComments] = useState<TokenComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Initial load
    Web3Database.getCommentsForToken(tokenId)
      .then((data) => {
        setComments(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    // Subscribe to updates
    const unsubscribe = Web3Database.subscribeToComments(tokenId, (newComment) => {
      setComments((prev) => {
        const exists = prev.find((c) => c.id === newComment.id);
        if (exists) return prev;
        return [newComment, ...prev];
      });
    });

    return unsubscribe;
  }, [tokenId]);

  const addComment = useCallback(async (content: string, authorAddress: string) => {
    try {
      const comment: TokenComment = {
        id: `${tokenId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tokenId,
        authorAddress,
        content,
        timestamp: new Date().toISOString(),
        likes: 0,
      };
      
      await Web3Database.addComment(comment);
      setComments((prev) => [comment, ...prev]);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [tokenId]);

  return { comments, loading, error, addComment };
}

// Hook for user profile
export function useUserProfile(address: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    setLoading(true);

    Web3Database.getUserProfile(address)
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [address]);

  const saveProfile = useCallback(async (data: Partial<UserProfile>) => {
    try {
      const profileData: UserProfile = {
        address,
        ...profile,
        ...data,
        createdAt: profile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await Web3Database.saveUserProfile(profileData);
      setProfile(profileData);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [address, profile]);

  return { profile, loading, error, saveProfile };
}

// Hook for token likes (FIXED)
export function useTokenLikes(tokenId: string, userAddress?: string) {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenId) {
      setLoading(false);
      return;
    }

    const loadLikes = async () => {
      try {
        setLoading(true);
        const count = await Web3Database.getTokenLikes(tokenId);
        setLikes(count);
        
        if (userAddress) {
          const liked = await Web3Database.hasLiked(tokenId, userAddress);
          setHasLiked(liked);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadLikes();

    // Subscribe to updates
    const unsubscribe = Web3Database.subscribeToTokenLikes(tokenId, (count) => {
      setLikes(count);
    });

    return unsubscribe;
  }, [tokenId, userAddress]);

  const toggleLike = useCallback(async () => {
    if (!userAddress) return false;

    try {
      if (hasLiked) {
        await Web3Database.removeLike(tokenId, userAddress);
        setHasLiked(false);
        setLikes((prev) => Math.max(prev - 1, 0));
      } else {
        await Web3Database.addLike(tokenId, userAddress);
        setHasLiked(true);
        setLikes((prev) => prev + 1);
      }
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [tokenId, userAddress, hasLiked]);

  return { likes, hasLiked, loading, error, toggleLike };
}
