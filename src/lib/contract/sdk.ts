/**
 * IITEBCH - Contract SDK (Server-side only)
 *
 * TypeScript interaction layer for the CashScript smart contracts.
 * Handles contract instantiation, quote generation, state parsing,
 * and transaction building for buy/sell/graduate operations.
 *
 * This module uses the cashscript package which requires Node.js APIs.
 * It should only be used in server components, API routes, or build scripts.
 */

import "server-only";
import { NetworkError, ContractError, BroadcastError, InsufficientFundsError } from '@/lib/errors';
import { withRetry, withTimeout } from '@/lib/retry';

import {
  Contract,
  TransactionBuilder,
  ElectrumNetworkProvider,
  SignatureTemplate,
  type Artifact,
  type Utxo,
  type NetworkProvider,
} from 'cashscript';
import { hash160 } from '@cashscript/utils';
import {
  encodeCashAddress,
  decodeCashAddress,
  CashAddressType,
} from '@bitauth/libauth';

import {
  TOTAL_SUPPLY,
  CURVE_SUPPLY,
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
} from './constants';

// ============================================================================
// Types
// ============================================================================

export type NetworkType = 'chipnet' | 'mainnet';

export interface NetworkConfig {
  network: NetworkType;
}

export interface BondingCurveParams {
  tokenCategory: string;    // 32-byte hex (reversed byte order, as on-chain)
  feeAddress: string;       // bitcoincash: or bchtest: P2PKH address
  slope: bigint;            // integer slope for on-chain math
  graduationTarget: bigint; // in satoshis
  curveSupply: bigint;      // max tokens on curve
}

export interface LaunchParams {
  creatorAddress: string;
  tokenName: string;
  tokenTicker: string;
}

export interface TradeQuote {
  tokenAmount: bigint;
  costSat: bigint;
  feeSat: bigint;
  totalSat: bigint;
  priceImpactPercent: number;
  newSupply: bigint;
}

export interface SellQuote {
  bchReturnSat: bigint;
  feeSat: bigint;
  netReturnSat: bigint;
  priceImpactPercent: number;
  newSupply: bigint;
}

export interface CurveState {
  currentSupply: bigint;
  reserveBalanceSat: bigint;
  currentPriceSat: bigint;
  graduationPercent: number;
  isGraduated: boolean;
  tokensRemaining: bigint;
}

export interface BondingCurveInstance {
  contract: Contract;
  params: BondingCurveParams;
  provider: NetworkProvider;
}

// ============================================================================
// Contract Artifact Loader
// ============================================================================

export async function loadBondingCurveArtifact(): Promise<Artifact> {
  const artifact = await import('../../contracts/BondingCurve.json', {
    with: { type: 'json' }
  });
  return artifact.default as unknown as Artifact;
}

export async function loadTokenLaunchArtifact(): Promise<Artifact> {
  const artifact = await import('../../contracts/TokenLaunch.json', {
    with: { type: 'json' }
  });
  return artifact.default as unknown as Artifact;
}

// ============================================================================
// Provider Factory
// ============================================================================

/**
 * Create a network provider for the given network.
 */
export function createProvider(
  network: NetworkType,
  electrumHost?: string,
): ElectrumNetworkProvider {
  const options = electrumHost ? { hostname: electrumHost } : undefined;
  return new ElectrumNetworkProvider(network, options);
}

// ============================================================================
// Contract Instantiation
// ============================================================================

/**
 * Instantiate a BondingCurve contract for a specific token.
 *
 * @param tokenCategory - The token category hex (display format, i.e. txid)
 * @param feeAddress - CashAddress (P2PKH) for fee collection
 * @param provider - Network provider
 * @param slope - Bonding curve slope (default: 1n)
 */
export async function instantiateBondingCurve(
  tokenCategory: string,
  feeAddress: string,
  provider: NetworkProvider,
  slope: bigint = 1n,
): Promise<BondingCurveInstance> {
  const artifact = await loadBondingCurveArtifact();

  // Decode fee address to hash160
  const decoded = decodeCashAddress(feeAddress);
  if (typeof decoded === 'string') {
    throw new ContractError(`Invalid fee address: ${decoded}`);
  }
  const feeHash160 = decoded.payload;

  // Token category in internal byte order (reversed)
  const tokenCategoryReversed = reverseTokenCategory(tokenCategory);

  const params: BondingCurveParams = {
    tokenCategory: tokenCategoryReversed,
    feeAddress,
    slope,
    graduationTarget: GRADUATION_TARGET_SAT,
    curveSupply: CURVE_SUPPLY,
  };

  const contract = new Contract(
    artifact,
    [tokenCategoryReversed, feeHash160, slope, GRADUATION_TARGET_SAT, CURVE_SUPPLY],
    { provider, addressType: 'p2sh32' },
  );

  return { contract, params, provider };
}

// ============================================================================
// On-chain State Reading
// ============================================================================

/**
 * Fetch the current on-chain state of a bonding curve.
 * Queries the Electrum server for the contract's UTXO.
 */
export async function fetchCurveState(
  instance: BondingCurveInstance,
): Promise<CurveState | null> {
  const utxos = await withRetry(
    () => withTimeout(instance.contract.getUtxos(), 10_000),
    {
      maxAttempts: 3,
      baseDelayMs: 400,
      onRetry: (err, attempt) =>
        console.warn(`[SDK] fetchCurveState retry #${attempt}:`, err),
    },
  ).catch((err) => {
    throw new NetworkError('Failed to fetch curve UTXOs', err);
  });

  // Find the UTXO with a mutable NFT (the state carrier)
  const curveUtxo = utxos.find(
    u => u.token?.nft?.capability === 'mutable' && u.token.nft.commitment,
  );

  if (!curveUtxo) return null;

  return parseCurveState(
    curveUtxo.satoshis,
    curveUtxo.token!.nft!.commitment,
    curveUtxo.token!.amount,
  );
}

/**
 * Get the contract UTXO (the single UTXO holding curve state + tokens).
 */
export async function getCurveUtxo(
  instance: BondingCurveInstance,
): Promise<Utxo | null> {
  const utxos = await withRetry(
    () => withTimeout(instance.contract.getUtxos(), 10_000),
    {
      maxAttempts: 3,
      baseDelayMs: 400,
      onRetry: (err, attempt) =>
        console.warn(`[SDK] getCurveUtxo retry #${attempt}:`, err),
    },
  ).catch((err) => {
    throw new NetworkError('Failed to fetch contract UTXOs', err);
  });
  return utxos.find(
    u => u.token?.nft?.capability === 'mutable',
  ) ?? null;
}

// ============================================================================
// Quote Engine (Off-chain calculations matching on-chain logic)
// ============================================================================

/**
 * Get a quote for buying tokens.
 * Mirrors the on-chain math exactly.
 */
export function getBuyQuote(
  currentSupply: bigint,
  tokensToBuy: bigint
): TradeQuote {
  const costSat = calculateBuyCostSat(currentSupply, tokensToBuy);
  const feeSat = calculateFeeSat(costSat);
  const totalSat = costSat + feeSat;

  const priceBefore = Number(currentSupply) * Number(SLOPE_NUMERATOR) / (Number(SLOPE_DENOMINATOR) * Number(PRECISION));
  const newSupply = currentSupply + tokensToBuy;
  const priceAfter = Number(newSupply) * Number(SLOPE_NUMERATOR) / (Number(SLOPE_DENOMINATOR) * Number(PRECISION));
  const priceImpactPercent = priceBefore > 0
    ? ((priceAfter - priceBefore) / priceBefore) * 100
    : 0;

  return {
    tokenAmount: tokensToBuy,
    costSat,
    feeSat,
    totalSat,
    priceImpactPercent,
    newSupply,
  };
}

/**
 * Get a quote for selling tokens.
 */
export function getSellQuote(
  currentSupply: bigint,
  tokensToSell: bigint
): SellQuote {
  const bchReturnSat = calculateSellReturnSat(currentSupply, tokensToSell);
  const feeSat = calculateFeeSat(bchReturnSat);
  const netReturnSat = bchReturnSat - feeSat;

  const priceBefore = Number(currentSupply) * Number(SLOPE_NUMERATOR) / (Number(SLOPE_DENOMINATOR) * Number(PRECISION));
  const newSupply = currentSupply - tokensToSell;
  const priceAfter = Number(newSupply) * Number(SLOPE_NUMERATOR) / (Number(SLOPE_DENOMINATOR) * Number(PRECISION));
  const priceImpactPercent = priceBefore > 0
    ? Math.abs((priceAfter - priceBefore) / priceBefore) * 100
    : 0;

  return {
    bchReturnSat,
    feeSat,
    netReturnSat,
    priceImpactPercent,
    newSupply,
  };
}

// ============================================================================
// Transaction Builders
// ============================================================================

/**
 * Build a buy transaction.
 *
 * The user sends BCH and receives tokens from the bonding curve.
 *
 * TX structure:
 *   Input 0: Bonding curve UTXO (contract)
 *   Input 1: User's BCH UTXO(s)
 *   Output 0: Updated bonding curve UTXO
 *   Output 1: User receives tokens
 *   Output 2: Fee to platform
 *   Output 3: User change (optional)
 */
export async function buildBuyTransaction(
  instance: BondingCurveInstance,
  tokensToBuy: bigint,
  userUtxos: Utxo[],
  userTokenAddress: string,
  userChangeAddress: string,
  userSigner: SignatureTemplate,
): Promise<TransactionBuilder> {
  const curveUtxo = await getCurveUtxo(instance);
  if (!curveUtxo) throw new ContractError('Bonding curve UTXO not found');

  // Get current state
  const currentSupply = decodeInt64(curveUtxo.token!.nft!.commitment);
  const quote = getBuyQuote(currentSupply, tokensToBuy);
  const newSupply = currentSupply + tokensToBuy;

  // Compute total BCH user must provide
  const totalUserBch = quote.totalSat;
  let userBchTotal = 0n;
  const selectedUtxos: Utxo[] = [];
  for (const utxo of userUtxos) {
    if (utxo.token) continue;
    selectedUtxos.push(utxo);
    userBchTotal += utxo.satoshis;
    if (userBchTotal >= totalUserBch + 1000n) break; // 1000 sats buffer for tx fee
  }

  if (userBchTotal < totalUserBch) {
    throw new InsufficientFundsError(
      `Insufficient BCH: need ${totalUserBch} sats, have ${userBchTotal} sats`,
      totalUserBch,
      userBchTotal,
    );
  }

  // Build the unlock for the contract input
  const contractUnlocker = instance.contract.unlock.buy(tokensToBuy);

  const builder = new TransactionBuilder({ provider: instance.provider })
    // Input 0: bonding curve UTXO
    .addInput(curveUtxo, contractUnlocker)
    // Input 1+: user's BCH
    .addInputs(selectedUtxos, userSigner.unlockP2PKH())
    // Output 0: Updated curve UTXO (more BCH, fewer tokens, updated state)
    .addOutput({
      to: instance.contract.tokenAddress,
      amount: curveUtxo.satoshis + quote.costSat,
      token: {
        amount: curveUtxo.token!.amount - tokensToBuy,
        category: curveUtxo.token!.category,
        nft: {
          capability: 'mutable' as const,
          commitment: encodeInt64(newSupply),
        },
      },
    })
    // Output 1: User receives tokens
    .addOutput({
      to: userTokenAddress,
      amount: DUST_LIMIT,
      token: {
        amount: tokensToBuy,
        category: curveUtxo.token!.category,
      },
    })
    // Output 2: Fee to platform (enforce dust minimum)
    .addOutput({
      to: instance.params.feeAddress,
      amount: quote.feeSat >= 546n ? quote.feeSat : 546n,
    });

  // Output 3: User change
  // P2SH32 CashScript txs are ~600 bytes; chipnet requires ~2 sat/byte
  const effectiveFee = quote.feeSat >= 546n ? quote.feeSat : 546n;
  const txNetworkFee = 3000n; // network miner fee (conservative)
  const userChange = userBchTotal - quote.costSat - effectiveFee - txNetworkFee;
  if (userChange >= DUST_LIMIT) {
    builder.addOutput({
      to: userChangeAddress,
      amount: userChange,
    });
  }

  return builder;
}

/**
 * Build a sell transaction.
 *
 * The user returns tokens and receives BCH from the bonding curve reserve.
 *
 * TX structure:
 *   Input 0: Bonding curve UTXO (contract)
 *   Input 1: User's token UTXO
 *   Input 2: User's BCH UTXO (for tx fees)
 *   Output 0: Updated bonding curve UTXO
 *   Output 1: User receives BCH
 *   Output 2: Fee to platform
 *   Output 3: User change (optional)
 */
export async function buildSellTransaction(
  instance: BondingCurveInstance,
  tokensToSell: bigint,
  userTokenUtxo: Utxo,
  userBchUtxo: Utxo,
  userAddress: string,
  userTokenAddress: string,
  userSigner: SignatureTemplate,
): Promise<TransactionBuilder> {
  const curveUtxo = await getCurveUtxo(instance);
  if (!curveUtxo) throw new ContractError('Bonding curve UTXO not found');

  const currentSupply = decodeInt64(curveUtxo.token!.nft!.commitment);
  const quote = getSellQuote(currentSupply, tokensToSell);
  const newSupply = currentSupply - tokensToSell;

  const contractUnlocker = instance.contract.unlock.sell(tokensToSell);

  const builder = new TransactionBuilder({ provider: instance.provider })
    // Input 0: bonding curve UTXO
    .addInput(curveUtxo, contractUnlocker)
    // Input 1: user's tokens
    .addInput(userTokenUtxo, userSigner.unlockP2PKH())
    // Input 2: user's BCH for fees
    .addInput(userBchUtxo, userSigner.unlockP2PKH())
    // Output 0: Updated curve UTXO (less BCH, more tokens, updated state)
    .addOutput({
      to: instance.contract.tokenAddress,
      amount: curveUtxo.satoshis - quote.bchReturnSat,
      token: {
        amount: curveUtxo.token!.amount + tokensToSell,
        category: curveUtxo.token!.category,
        nft: {
          capability: 'mutable' as const,
          commitment: encodeInt64(newSupply),
        },
      },
    })
    // Output 1: User receives BCH
    .addOutput({
      to: userAddress,
      amount: quote.netReturnSat,
    })
    // Output 2: Fee to platform
    .addOutput({
      to: instance.params.feeAddress,
      amount: quote.feeSat,
    });

  // Return remaining tokens to user if they had more than they're selling
  const userRemainingTokens = userTokenUtxo.token!.amount - tokensToSell;
  if (userRemainingTokens > 0n) {
    builder.addOutput({
      to: userTokenAddress,
      amount: DUST_LIMIT,
      token: {
        amount: userRemainingTokens,
        category: userTokenUtxo.token!.category,
      },
    });
  }

  return builder;
}

// ============================================================================
// State Parser
// ============================================================================

/**
 * Parse the current state of a bonding curve from UTXO data.
 */
export function parseCurveState(
  utxoValueSat: bigint,
  nftCommitment: string,
  tokenAmount: bigint,
): CurveState {
  const currentSupply = decodeInt64(nftCommitment);
  const currentPriceSat = (SLOPE_NUMERATOR * currentSupply) / (SLOPE_DENOMINATOR * PRECISION);
  const graduationPercent = Number((utxoValueSat * 100n) / GRADUATION_TARGET_SAT);

  return {
    currentSupply,
    reserveBalanceSat: utxoValueSat,
    currentPriceSat,
    graduationPercent: Math.min(graduationPercent, 100),
    isGraduated: utxoValueSat >= GRADUATION_TARGET_SAT,
    tokensRemaining: tokenAmount,
  };
}

// ============================================================================
// Utility: Byte encoding / address helpers
// ============================================================================

/**
 * Reverse hex byte order (wallet/display format <-> introspection/internal format)
 */
export function reverseTokenCategory(hex: string): string {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = clean.match(/.{2}/g);
  if (!bytes) return hex;
  return bytes.reverse().join('');
}

/**
 * Encode a BigInt as bytes8 hex for NFT commitment (little-endian).
 */
export function encodeInt64(value: bigint): string {
  const hex = value.toString(16).padStart(16, '0');
  const bytes = hex.match(/.{2}/g)!;
  return bytes.reverse().join('');
}

/**
 * Decode bytes8 hex (little-endian) to BigInt.
 */
export function decodeInt64(hex: string): bigint {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (!clean || clean === '') return 0n;
  const bytes = clean.match(/.{2}/g)!;
  const beHex = bytes.reverse().join('');
  return BigInt('0x' + beHex);
}

/**
 * Derive a CashAddress from a public key hash.
 */
export function pubkeyHashToAddress(
  pkHash: Uint8Array,
  network: NetworkType,
  withTokens: boolean,
): string {
  const prefix = network === 'mainnet' ? 'bitcoincash' : 'bchtest';
  const type = withTokens ? CashAddressType.p2pkhWithTokens : CashAddressType.p2pkh;
  const result = encodeCashAddress({ payload: pkHash, prefix, type });
  if (typeof result === 'string') {
    throw new Error(`Failed to encode CashAddress: ${result}`);
  }
  return result.address;
}

/**
 * Extract hash160 from a CashAddress.
 */
export function addressToHash160(address: string): Uint8Array {
  const decoded = decodeCashAddress(address);
  if (typeof decoded === 'string') {
    throw new Error(`Invalid CashAddress: ${decoded}`);
  }
  return decoded.payload;
}

/**
 * Convert any BCH cash address to its token-capable variant.
 * Token outputs must target a P2PKH-with-tokens (CashTokens) address.
 */
export function toTokenAddress(address: string, network: NetworkType): string {
  const hash = addressToHash160(address);
  return pubkeyHashToAddress(hash, network, true);
}

/**
 * Normalize a BCH CashAddress by ensuring it has the correct prefix.
 * Handles addresses provided without a prefix (e.g. from Cashonize wallet).
 */
export function normalizeAddress(address: string, network?: NetworkType): string {
  if (!address) return address;

  // Already has a valid prefix
  if (address.startsWith('bitcoincash:') || address.startsWith('bchtest:')) {
    return address;
  }

  // Determine network from env or parameter
  const net = network || (process.env.NEXT_PUBLIC_NETWORK as NetworkType) || 'chipnet';
  const prefix = net === 'mainnet' ? 'bitcoincash' : 'bchtest';

  // Try with the prefix  
  const withPrefix = `${prefix}:${address}`;
  try {
    const decoded = decodeCashAddress(withPrefix);
    if (typeof decoded !== 'string') return withPrefix;
  } catch {
    // ignore
  }

  // Try the other prefix as fallback
  const altPrefix = prefix === 'bchtest' ? 'bitcoincash' : 'bchtest';
  const withAlt = `${altPrefix}:${address}`;
  try {
    const decoded = decodeCashAddress(withAlt);
    if (typeof decoded !== 'string') return withAlt;
  } catch {
    // ignore
  }

  // Return original if nothing worked
  return address;
}

/**
 * Verify if a string is a valid BCH cash address.
 * Automatically normalizes addresses without prefix.
 */
export function verifyAddress(address: string): boolean {
  try {
    const normalized = normalizeAddress(address);
    const decoded = decodeCashAddress(normalized);
    return typeof decoded !== 'string';
  } catch {
    return false;
  }
}

/**
 * Broadcast a signed transaction to the BCH network.
 */
export async function broadcastTransaction(
  signedTxHex: string,
  network: NetworkType = 'mainnet'
): Promise<string> {
  const provider = createProvider(network);

  return withRetry(
    () => withTimeout(provider.sendRawTransaction(signedTxHex), 15_000),
    {
      maxAttempts: 2,
      baseDelayMs: 1_000,
      onRetry: (err, attempt) =>
        console.warn(`[SDK] broadcastTransaction retry #${attempt}:`, err),
    },
  ).catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    // Double-spend / mempool-conflict errors are NOT retryable
    const retryable = !/mempool|conflict|dust|fee/i.test(msg);
    throw new BroadcastError(`Broadcast failed: ${msg}`, { retryable, cause: err });
  });
}

/**
 * Get transaction confirmation status.
 */
export async function getTransactionStatus(
  txid: string,
  network: NetworkType = 'mainnet'
): Promise<{ confirmed: boolean; confirmations: number }> {
  const provider = createProvider(network);

  try {
    const tx = await provider.getRawTransaction(txid);
    if (!tx || tx === '') {
      return { confirmed: false, confirmations: 0 };
    }

    return { confirmed: true, confirmations: 1 };
  } catch {
    return { confirmed: false, confirmations: 0 };
  }
}

/**
 * Select optimal UTXOs for a transaction.
 */
export function selectUtxos(
  utxos: Utxo[],
  amountNeeded: bigint,
  includeTokens: boolean = false
): { selected: Utxo[]; total: bigint; remaining: Utxo[] } {
  const filtered = includeTokens
    ? utxos
    : utxos.filter(u => !u.token);

  const sorted = [...filtered].sort((a, b) =>
    Number(a.satoshis) - Number(b.satoshis)
  );

  const selected: Utxo[] = [];
  let total = 0n;

  for (const utxo of sorted) {
    selected.push(utxo);
    total += BigInt(utxo.satoshis);
    if (total >= amountNeeded) break;
  }

  if (total < amountNeeded) {
    throw new Error('Insufficient UTXOs');
  }

  const remaining = sorted.filter(u => !selected.includes(u));

  return { selected, total, remaining };
}

/**
 * Estimate transaction fee based on size.
 */
export function estimateFee(txSizeBytes: number, feePerByte: bigint = 1n): bigint {
  const minimumFee = 546n;
  const estimated = BigInt(txSizeBytes) * feePerByte;
  return estimated > minimumFee ? estimated : minimumFee;
}

/**
 * Get network chain for transaction fees.
 */
export async function getNetworkFeeRate(network: NetworkType = 'mainnet'): Promise<bigint> {
  return 1n;
}
