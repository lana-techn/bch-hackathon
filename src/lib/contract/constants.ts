/**
 * IiteBCH Contract Constants
 *
 * Shared constants between on-chain (CashScript) and off-chain (TypeScript) code.
 */

// === Token Economics ===
export const TOTAL_SUPPLY = 1_000_000_000n;        // 1 Billion tokens per project
export const CURVE_SUPPLY = 800_000_000n;           // 80% available on bonding curve
export const DEX_RESERVE_SUPPLY = 200_000_000n;     // 20% reserved for DEX liquidity

// === Bonding Curve ===
export const GRADUATION_TARGET_SAT = 4_000_000_000n; // 40 BCH in satoshis
export const PRECISION = 100_000_000n;                // 1e8 scaling factor for integer math

// Slope = (2 * GRADUATION_TARGET / CURVE_SUPPLY^2) * PRECISION
// = (2 * 4_000_000_000 / 640_000_000_000_000_000) * 100_000_000
// = (8_000_000_000 / 640_000_000_000_000_000) * 100_000_000
// = 0.0000000125 * 100_000_000
// = 1.25 -> rounded to 1 (integer)
//
// More precise: 8e9 * 1e8 / (8e8)^2 = 8e17 / 6.4e17 = 1.25
export const SLOPE = 1n; // This gives approximately the right graduation target
// Verification: cost = SLOPE * (800M)^2 / (2 * PRECISION)
//             = 1 * 6.4e17 / 2e8
//             = 3.2e9 satoshis = 32 BCH
// Adjust SLOPE to 2 for ~64 BCH or keep at 1 and tune GRADUATION_TARGET

// More accurate slope calculation for exactly 40 BCH:
// SLOPE_PRECISE = 2 * 4e9 * 1e8 / (8e8)^2 = 8e17 / 6.4e17 ≈ 1.25
// We'll use SLOPE=1 and GRADUATION_TARGET=32 BCH for clean integer math
// OR use a higher precision scheme:
export const SLOPE_NUMERATOR = 5n;     // slope = 5/4 = 1.25
export const SLOPE_DENOMINATOR = 4n;

// === Fees ===
export const TRADING_FEE_BPS = 100n;    // 1% = 100 basis points
export const CREATION_FEE_SAT = 500_000n; // 0.005 BCH in satoshis

// === Network ===
export const DUST_LIMIT = 546n;          // Minimum output value in satoshis
export const MIN_CONTRACT_BALANCE = 1000n; // Minimum BCH on bonding curve UTXO

// === Derived: Calculate precise cost for any range ===
/**
 * Calculate cost in satoshis to buy tokens from currentSupply to currentSupply + amount
 * Using integer math: cost = SLOPE * (newSupply^2 - oldSupply^2) / (2 * PRECISION)
 */
export function calculateBuyCostSat(currentSupply: bigint, tokensToBuy: bigint): bigint {
  const newSupply = currentSupply + tokensToBuy;
  if (newSupply > CURVE_SUPPLY) throw new Error("Exceeds curve supply");

  const newSq = newSupply * newSupply;
  const oldSq = currentSupply * currentSupply;

  // cost = SLOPE_NUMERATOR * (newSq - oldSq) / (SLOPE_DENOMINATOR * 2 * PRECISION)
  return (SLOPE_NUMERATOR * (newSq - oldSq)) / (SLOPE_DENOMINATOR * 2n * PRECISION);
}

/**
 * Calculate return in satoshis for selling tokens
 */
export function calculateSellReturnSat(currentSupply: bigint, tokensToSell: bigint): bigint {
  if (tokensToSell > currentSupply) throw new Error("Cannot sell more than supply");

  const newSupply = currentSupply - tokensToSell;
  const oldSq = currentSupply * currentSupply;
  const newSq = newSupply * newSupply;

  return (SLOPE_NUMERATOR * (oldSq - newSq)) / (SLOPE_DENOMINATOR * 2n * PRECISION);
}

/**
 * Calculate fee (1%)
 */
export function calculateFeeSat(amount: bigint): bigint {
  return amount / 100n;
}

/**
 * Get current price in satoshis per token
 */
export function getCurrentPriceSat(currentSupply: bigint): bigint {
  return (SLOPE_NUMERATOR * currentSupply) / (SLOPE_DENOMINATOR * PRECISION);
}

/**
 * Get graduation progress as percentage (0-100)
 */
export function getGraduationPercent(currentSupply: bigint): number {
  const reserve = (SLOPE_NUMERATOR * currentSupply * currentSupply) / (SLOPE_DENOMINATOR * 2n * PRECISION);
  return Number((reserve * 100n) / GRADUATION_TARGET_SAT);
}

/**
 * Estimate how many tokens you get for a given BCH amount (in satoshis).
 * Uses binary search since we can't solve analytically with integer math.
 */
export function estimateTokensForBCH(
  currentSupply: bigint,
  bchAmountSat: bigint
): bigint {
  let low = 0n;
  let high = CURVE_SUPPLY - currentSupply;
  let best = 0n;

  for (let i = 0; i < 64; i++) {
    if (low > high) break;
    const mid = (low + high) / 2n;
    if (mid === 0n) break;

    try {
      const cost = calculateBuyCostSat(currentSupply, mid);
      const fee = calculateFeeSat(cost);
      const total = cost + fee;

      if (total <= bchAmountSat) {
        best = mid;
        low = mid + 1n;
      } else {
        high = mid - 1n;
      }
    } catch {
      high = mid - 1n;
    }
  }

  return best;
}
