export interface Token {
  id: string;
  name: string;
  ticker: string;
  image: string;
  description: string;
  creatorAddress: string;
  createdAt: string;
  totalSupply: number;
  currentSupply: number; // tokens sold via bonding curve
  marketCapBCH: number;
  priceBCH: number;
  priceUSD: number;
  change24h: number;
  volume24hBCH: number;
  graduationTarget: number; // BCH needed to graduate to DEX
  isGraduated: boolean;
  holders: number;
  txCount: number;
  // Additional performance metrics
  athBCH?: number; // All time high price
  atlBCH?: number; // All time low price
  athDate?: string;
  atlDate?: string;
  volume7dBCH?: number;
  volume30dBCH?: number;
  change7d?: number;
  change30d?: number;
  liquidityBCH?: number;
  topHolders?: { address: string; percentage: number }[];
  category?: 'meme' | 'defi' | 'nft' | 'gaming' | 'other';
  socials?: {
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
}

export interface Trade {
  id: string;
  tokenId: string;
  type: "buy" | "sell";
  amountBCH: number;
  amountToken: number;
  pricePerToken: number;
  traderAddress: string;
  timestamp: string;
  txHash: string;
}

export interface Comment {
  id: string;
  tokenId: string;
  authorAddress: string;
  authorRole: "dev" | "top_holder" | "user";
  content: string;
  timestamp: string;
  likes: number;
}

export interface OHLCVCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BondingCurveState {
  totalSupply: number;
  currentSupply: number;
  reserveBalance: number; // BCH in the curve
  graduationTarget: number;
  currentPrice: number;
  progressPercent: number;
}
