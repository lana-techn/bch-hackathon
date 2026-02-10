/**
 * IiteBCH Bonding Curve Mathematics
 *
 * Uses a Linear Bonding Curve: P = m * S
 * Where:
 *   P = price per token (in BCH)
 *   m = slope constant
 *   S = current supply sold
 *
 * The integral gives the total cost to buy from 0 to S:
 *   Cost = (m/2) * S^2
 *
 * Configuration:
 *   Total Supply: 1,000,000,000 (1 Billion)
 *   Graduation Target: 40 BCH
 *   At graduation, 80% of supply sold via curve (800M tokens)
 *   Remaining 20% reserved for DEX liquidity
 */

const TOTAL_SUPPLY = 1_000_000_000;
const CURVE_SUPPLY = 800_000_000; // 80% available on bonding curve
const GRADUATION_TARGET_BCH = 40;

// Slope: m = 2 * GraduationTarget / CurveSupply^2
const SLOPE = (2 * GRADUATION_TARGET_BCH) / (CURVE_SUPPLY * CURVE_SUPPLY);

/**
 * Get the current price given how many tokens have been sold
 */
export function getCurrentPrice(currentSupplySold: number): number {
  return SLOPE * currentSupplySold;
}

/**
 * Calculate cost in BCH to buy `amount` tokens starting from `currentSupplySold`
 * Cost = integral from S to S+amount of (m * s) ds
 *      = (m/2) * [(S+amount)^2 - S^2]
 */
export function calculateBuyCost(
  currentSupplySold: number,
  amount: number
): number {
  const newSupply = currentSupplySold + amount;
  if (newSupply > CURVE_SUPPLY) {
    throw new Error("Exceeds available curve supply");
  }
  return (SLOPE / 2) * (newSupply * newSupply - currentSupplySold * currentSupplySold);
}

/**
 * Calculate BCH returned when selling `amount` tokens
 * Return = (m/2) * [S^2 - (S-amount)^2]
 */
export function calculateSellReturn(
  currentSupplySold: number,
  amount: number
): number {
  if (amount > currentSupplySold) {
    throw new Error("Cannot sell more than current supply");
  }
  const newSupply = currentSupplySold - amount;
  return (SLOPE / 2) * (currentSupplySold * currentSupplySold - newSupply * newSupply);
}

/**
 * Calculate how many tokens you get for a given BCH amount
 * Solve: bchAmount = (m/2) * [(S + tokens)^2 - S^2]
 * => tokens = sqrt(S^2 + 2*bchAmount/m) - S
 */
export function calculateTokensForBCH(
  currentSupplySold: number,
  bchAmount: number
): number {
  const discriminant = currentSupplySold * currentSupplySold + (2 * bchAmount) / SLOPE;
  const tokens = Math.sqrt(discriminant) - currentSupplySold;
  return Math.max(0, Math.min(tokens, CURVE_SUPPLY - currentSupplySold));
}

/**
 * Get the total reserve (BCH) locked in the curve at current supply
 */
export function getReserveBalance(currentSupplySold: number): number {
  return (SLOPE / 2) * currentSupplySold * currentSupplySold;
}

/**
 * Get graduation progress as percentage
 */
export function getGraduationProgress(currentSupplySold: number): number {
  const reserve = getReserveBalance(currentSupplySold);
  return Math.min((reserve / GRADUATION_TARGET_BCH) * 100, 100);
}

/**
 * Calculate market cap in BCH
 * MarketCap = currentPrice * totalCirculatingSupply
 */
export function getMarketCapBCH(currentSupplySold: number): number {
  return getCurrentPrice(currentSupplySold) * currentSupplySold;
}

/**
 * Apply trading fee (1%)
 */
export function applyFee(amount: number): { net: number; fee: number } {
  const fee = amount * 0.01;
  return { net: amount - fee, fee };
}

/**
 * Calculate price impact for a trade
 */
export function calculatePriceImpact(
  currentSupplySold: number,
  bchAmount: number,
  isBuy: boolean
): number {
  const priceBefore = getCurrentPrice(currentSupplySold);
  const tokens = calculateTokensForBCH(currentSupplySold, bchAmount);
  const priceAfter = isBuy
    ? getCurrentPrice(currentSupplySold + tokens)
    : getCurrentPrice(Math.max(0, currentSupplySold - tokens));
  return Math.abs((priceAfter - priceBefore) / priceBefore) * 100;
}

export const CONSTANTS = {
  TOTAL_SUPPLY,
  CURVE_SUPPLY,
  GRADUATION_TARGET_BCH,
  SLOPE,
} as const;
