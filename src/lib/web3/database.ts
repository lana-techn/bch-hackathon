/**
 * Simplified Web3 Database using localStorage
 * 
 * Gun.js relay down, using localStorage for now
 * Data persists per browser
 */

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
}

export interface TokenMetadata {
  id: string;
  name: string;
  ticker: string;
  description: string;
  image?: string;
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

// Storage keys
const COMMENTS_KEY = 'ignitebch_comments';
const LIKES_KEY = 'ignitebch_likes';
const PROFILES_KEY = 'ignitebch_profiles';
const TOKENS_KEY = 'ignitebch_tokens';

// Helper functions
const getStorage = (key: string) => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setStorage = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

export class Web3Database {
  // ========== TOKEN METADATA ==========
  
  static async saveTokenMetadata(token: TokenMetadata): Promise<void> {
    const tokens = getStorage(TOKENS_KEY);
    const index = tokens.findIndex((t: TokenMetadata) => t.id === token.id);
    if (index >= 0) {
      tokens[index] = token;
    } else {
      tokens.push(token);
    }
    setStorage(TOKENS_KEY, tokens);
  }

  static async getTokenMetadata(tokenId: string): Promise<TokenMetadata | null> {
    const tokens = getStorage(TOKENS_KEY);
    return tokens.find((t: TokenMetadata) => t.id === tokenId) || null;
  }

  static async getAllTokenMetadata(): Promise<TokenMetadata[]> {
    return getStorage(TOKENS_KEY);
  }

  // ========== USER PROFILES ==========
  
  static async saveUserProfile(profile: UserProfile): Promise<void> {
    const profiles = getStorage(PROFILES_KEY);
    const index = profiles.findIndex((p: UserProfile) => p.address === profile.address);
    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profiles.push(profile);
    }
    setStorage(PROFILES_KEY, profiles);
  }

  static async getUserProfile(address: string): Promise<UserProfile | null> {
    const profiles = getStorage(PROFILES_KEY);
    return profiles.find((p: UserProfile) => p.address === address) || null;
  }

  // ========== COMMENTS ==========
  
  static async addComment(comment: TokenComment): Promise<void> {
    const comments = getStorage(COMMENTS_KEY);
    comments.push(comment);
    setStorage(COMMENTS_KEY, comments);
  }

  static async getCommentsForToken(tokenId: string): Promise<TokenComment[]> {
    const comments = getStorage(COMMENTS_KEY);
    return comments
      .filter((c: TokenComment) => c.tokenId === tokenId)
      .sort((a: TokenComment, b: TokenComment) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }

  // ========== LIKES (FIXED) ==========
  
  static async addLike(tokenId: string, userAddress: string): Promise<void> {
    const likes = getStorage(LIKES_KEY);
    const exists = likes.find((l: UserLike) => 
      l.tokenId === tokenId && l.userAddress === userAddress
    );
    if (!exists) {
      likes.push({
        tokenId,
        userAddress,
        timestamp: new Date().toISOString(),
      });
      setStorage(LIKES_KEY, likes);
    }
  }

  static async removeLike(tokenId: string, userAddress: string): Promise<void> {
    const likes = getStorage(LIKES_KEY);
    const filtered = likes.filter((l: UserLike) => 
      !(l.tokenId === tokenId && l.userAddress === userAddress)
    );
    setStorage(LIKES_KEY, filtered);
  }

  static async hasLiked(tokenId: string, userAddress: string): Promise<boolean> {
    const likes = getStorage(LIKES_KEY);
    return likes.some((l: UserLike) => 
      l.tokenId === tokenId && l.userAddress === userAddress
    );
  }

  static async getTokenLikes(tokenId: string): Promise<number> {
    const likes = getStorage(LIKES_KEY);
    return likes.filter((l: UserLike) => l.tokenId === tokenId).length;
  }

  // ========== REAL-TIME (Simulated with interval) ==========
  
  static subscribeToComments(tokenId: string, callback: (comment: TokenComment) => void): () => void {
    // Check for new comments every 2 seconds
    let lastComments = getStorage(COMMENTS_KEY);
    
    const interval = setInterval(() => {
      const comments = getStorage(COMMENTS_KEY);
      const newComments = comments.filter((c: TokenComment) => 
        c.tokenId === tokenId && 
        !lastComments.find((lc: TokenComment) => lc.id === c.id)
      );
      
      newComments.forEach((c: TokenComment) => callback(c));
      lastComments = comments;
    }, 2000);
    
    return () => clearInterval(interval);
  }

  static subscribeToTokenLikes(tokenId: string, callback: (count: number) => void): () => void {
    let lastCount = 0;
    
    const interval = setInterval(() => {
      const likes = getStorage(LIKES_KEY);
      const count = likes.filter((l: UserLike) => l.tokenId === tokenId).length;
      
      if (count !== lastCount) {
        callback(count);
        lastCount = count;
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }
}

export default Web3Database;
