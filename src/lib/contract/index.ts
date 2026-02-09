/**
 * IgniteBCH Contract SDK - Public API
 *
 * Client-safe exports from constants.ts
 * Server-only exports should be imported directly from './sdk'
 */

// Client-safe: pure math, no Node.js dependencies
export {
  TOTAL_SUPPLY,
  CURVE_SUPPLY,
  DEX_RESERVE_SUPPLY,
  GRADUATION_TARGET_SAT,
  PRECISION,
  SLOPE_NUMERATOR,
  SLOPE_DENOMINATOR,
  CREATION_FEE_SAT,
  DUST_LIMIT,
  MIN_CONTRACT_BALANCE,
  calculateBuyCostSat,
  calculateSellReturnSat,
  calculateFeeSat,
  getCurrentPriceSat,
  getGraduationPercent,
  estimateTokensForBCH,
} from './constants';

// Server-only types (safe to re-export types, they're erased at compile time)
export type {
  NetworkType,
  NetworkConfig,
  BondingCurveParams,
  BondingCurveInstance,
  LaunchParams,
  TradeQuote,
  SellQuote,
  CurveState,
} from './sdk';
