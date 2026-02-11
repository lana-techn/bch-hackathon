/**
 * IgniteBCH - Web3 Database Service
 * 
 * Hybrid architecture:
 * - Gun.js: Real-time P2P data (comments, likes, user profiles)
 * - IPFS: File storage (token images, metadata)
 * - Blockchain: Source of truth (tokens, trades)
 */

import Gun from 'gun';

// Types for our data
export interface UserProfile {
  address: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  twitter?: string;
  telegram?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TokenComment {
  id: string;
  tokenId: string;
  authorAddress: string;
  content: string;
  timestamp: string;
  likes: number;
  replies?: TokenComment[];
}

export interface TokenMetadata {
  id: string; // token category
  name: string;
  ticker: string;
  description: string;
  image?: string; // IPFS hash
  website?: string;
  twitter?: string;
  telegram?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserLike {
  tokenId: string;
  userAddress: string;
  timestamp: string;
}

// Initialize Gun
const gun = Gun({
  peers: [
    'https://gun-manhattan.herokuapp.com/gun', // Public relay
    'https://gun-us.herokuapp.com/gun',
  ],
  localStorage: false, // Don't use localStorage in browser
  radisk: true, // Use IndexedDB
});

// Namespaced nodes
const tokensNode = gun.get('ignitebch_tokens');
const usersNode = gun.get('ignitebch_users');
const commentsNode = gun.get('ignitebch_comments');
const likesNode = gun.get('ignitebch_likes');

export class Web3Database {
  // ========== TOKEN METADATA ==========
  
  static async saveTokenMetadata(token: TokenMetadata): Promise<void> {
    return new Promise((resolve, reject) => {
      tokensNode.get(token.id).put(token, (ack: any) => {
        if (ack?.err) reject(new Error(ack.err));
        else resolve();
      });
    });
  }

  static async getTokenMetadata(tokenId: string): Promise<TokenMetadata | null> {
    return new Promise((resolve) => {
      tokensNode.get(tokenId).once((data: unknown) => {
        resolve(data as TokenMetadata | null);
      });
    });
  }

  static async getAllTokenMetadata(): Promise<TokenMetadata[]> {
    return new Promise((resolve) => {
      const tokens: TokenMetadata[] = [];
      tokensNode.map().once((data: unknown, id: string) => {
        if (data && id) {
          tokens.push(data as TokenMetadata);
        }
      });
      // Return after a short delay to collect data
      setTimeout(() => resolve(tokens), 1000);
    });
  }

  // ========== USER PROFILES ==========
  
  static async saveUserProfile(profile: UserProfile): Promise<void> {
    return new Promise((resolve, reject) => {
      usersNode.get(profile.address).put(profile, (ack: any) => {
        if (ack?.err) reject(new Error(ack.err));
        else resolve();
      });
    });
  }

  static async getUserProfile(address: string): Promise<UserProfile | null> {
    return new Promise((resolve) => {
      usersNode.get(address).once((data: unknown) => {
        resolve(data as UserProfile | null);
      });
    });
  }

  // ========== COMMENTS ==========
  
  static async addComment(comment: TokenComment): Promise<void> {
    return new Promise((resolve, reject) => {
      const commentRef = commentsNode.get(comment.id);
      commentRef.put(comment, (ack: any) => {
        if (ack?.err) reject(new Error(ack.err));
        else {
          // Also add to token's comments list
          tokensNode.get(comment.tokenId).get('comments').set(commentRef);
          resolve();
        }
      });
    });
  }

  static async getCommentsForToken(tokenId: string): Promise<TokenComment[]> {
    return new Promise((resolve) => {
      const comments: TokenComment[] = [];
      commentsNode.map().once((data: unknown) => {
        const comment = data as TokenComment | null;
        if (comment && comment.tokenId === tokenId) {
          comments.push(comment);
        }
      });
      setTimeout(() => {
        // Sort by timestamp
        comments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        resolve(comments);
      }, 1000);
    });
  }

  // ========== LIKES ==========
  
  static async addLike(tokenId: string, userAddress: string): Promise<void> {
    const likeId = `${tokenId}_${userAddress}`;
    const like: UserLike = {
      tokenId,
      userAddress,
      timestamp: new Date().toISOString(),
    };
    
    return new Promise((resolve, reject) => {
      likesNode.get(likeId).put(like, (ack: any) => {
        if (ack?.err) reject(new Error(ack.err));
        else {
          // Increment token like count
          tokensNode.get(tokenId).get('likes').once((current: unknown) => {
            const count = (current as number || 0) + 1;
            tokensNode.get(tokenId).get('likes').put(count);
          });
          resolve();
        }
      });
    });
  }

  static async removeLike(tokenId: string, userAddress: string): Promise<void> {
    const likeId = `${tokenId}_${userAddress}`;
    
    return new Promise((resolve, reject) => {
      likesNode.get(likeId).put(null, (ack: any) => {
        if (ack?.err) reject(new Error(ack.err));
        else {
          // Decrement token like count
          tokensNode.get(tokenId).get('likes').once((current: unknown) => {
            const count = Math.max((current as number || 1) - 1, 0);
            tokensNode.get(tokenId).get('likes').put(count);
          });
          resolve();
        }
      });
    });
  }

  static async hasLiked(tokenId: string, userAddress: string): Promise<boolean> {
    const likeId = `${tokenId}_${userAddress}`;
    return new Promise((resolve) => {
      likesNode.get(likeId).once((data: unknown) => {
        resolve(!!data);
      });
    });
  }

  static async getTokenLikes(tokenId: string): Promise<number> {
    return new Promise((resolve) => {
      tokensNode.get(tokenId).get('likes').once((count: unknown) => {
        resolve(count as number || 0);
      });
    });
  }

  // ========== REAL-TIME SUBSCRIPTIONS ==========
  
  static subscribeToComments(tokenId: string, callback: (comment: TokenComment) => void): void {
    commentsNode.map().on((data: unknown) => {
      const comment = data as TokenComment | null;
      if (comment && comment.tokenId === tokenId) {
        callback(comment);
      }
    });
  }

  static subscribeToTokenMetadata(tokenId: string, callback: (token: TokenMetadata) => void): void {
    tokensNode.get(tokenId).on((data: unknown) => {
      if (data) {
        callback(data as TokenMetadata);
      }
    });
  }
}

export default Web3Database;
