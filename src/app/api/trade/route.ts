import { NextRequest, NextResponse } from 'next/server';
import {
  fetchCurveState,
  buildBuyTransaction,
  buildSellTransaction,
  createProvider,
  instantiateBondingCurve,
  broadcastTransaction,
  getBuyQuote,
  getSellQuote,
  verifyAddress,
  selectUtxos,
  toTokenAddress,
} from '@/lib/contract/sdk';
import {
  AppError,
  ValidationError,
  InsufficientFundsError,
  NetworkError,
  BroadcastError,
  ContractError,
  toAppError,
} from '@/lib/errors';
import { buildBchPaymentUri } from '@/lib/bchUri';
import { SignatureTemplate } from 'cashscript';
import { decodePrivateKeyWif } from '@bitauth/libauth';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function reqId(): string {
  return crypto.randomUUID();
}

function errResp(id: string, err: AppError) {
  const headers: Record<string, string> = {};
  if (err instanceof NetworkError) headers['Retry-After'] = '5';
  return NextResponse.json(
    { error: err.message, code: err.code, retryable: err.retryable, requestId: id },
    { status: err.httpStatus, headers },
  );
}

/**
 * Load the demo signing key from env.
 * Returns null if not configured (will fall back to Cashonize URI flow).
 */
function loadDemoSigner(): SignatureTemplate | null {
  const wif = process.env.DEMO_SIGNING_WIF;
  if (!wif) return null;
  try {
    const decoded = decodePrivateKeyWif(wif);
    if (typeof decoded === 'string') return null; // error string
    return new SignatureTemplate(decoded.privateKey);
  } catch {
    return null;
  }
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const id = reqId();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body', code: 'VALIDATION_ERROR', requestId: id },
      { status: 400 },
    );
  }

  const {
    action,
    tokenId,
    tokensToBuy,
    tokensToSell,
    buyerAddress,
    sellerAddress,
    signedTxHex,
  } = body;

  // ── Shared validation ────────────────────────────────────────────────────────
  if (!tokenId) {
    return errResp(id, new ValidationError('Missing tokenId', 'tokenId'));
  }

  const network = (process.env.NEXT_PUBLIC_NETWORK as 'chipnet' | 'mainnet') || 'chipnet';

  let provider: ReturnType<typeof createProvider>;
  let instance: Awaited<ReturnType<typeof instantiateBondingCurve>>;
  try {
    provider = createProvider(network);
    const feeAddress =
      process.env.FEE_ADDRESS ||
      (network === 'chipnet'
        ? 'bchtest:qqttvxd9g5yw23q5leregzu5v8vkqajtcsc0klq8fa'
        : 'bitcoincash:qqttvxd9g5yw23q5leregzu5v8vkqajtcsc0klq8fa');
    instance = await instantiateBondingCurve(tokenId, feeAddress, provider);
  } catch (err) {
    const appErr =
      err instanceof AppError
        ? err
        : new ContractError(err instanceof Error ? err.message : String(err));
    console.error({ requestId: id, action: 'instantiate', error: appErr });
    return errResp(id, appErr);
  }

  // ── getCurveState ─────────────────────────────────────────────────────────────
  if (action === 'getCurveState') {
    try {
      const state = await fetchCurveState(instance);
      // Serialize BigInt fields to strings for JSON compatibility
      const serialized = state ? {
        currentSupply: state.currentSupply.toString(),
        reserveBalanceSat: state.reserveBalanceSat.toString(),
        currentPriceSat: state.currentPriceSat.toString(),
        graduationPercent: state.graduationPercent,
        isGraduated: state.isGraduated,
        tokensRemaining: state.tokensRemaining.toString(),
      } : null;
      return NextResponse.json({ state: serialized, requestId: id });
    } catch (err) {
      const appErr = toAppError(err);
      console.error({ requestId: id, action, error: appErr });
      return errResp(id, appErr);
    }
  }

  // ── getContractInfo ─────────────────────────────────────────────────────────
  // Returns the contract BCH address and token address (for wallet integrations)
  if (action === 'getContractInfo') {
    return NextResponse.json({
      requestId: id,
      contractAddress: instance.contract.address,
      contractTokenAddress: instance.contract.tokenAddress,
      network,
    });
  }

  // ── buy ───────────────────────────────────────────────────────────────────────
  if (action === 'buy') {
    if (!buyerAddress)
      return errResp(id, new ValidationError('Missing buyerAddress', 'buyerAddress'));
    if (!tokensToBuy)
      return errResp(id, new ValidationError('Missing tokensToBuy', 'tokensToBuy'));
    if (!verifyAddress(buyerAddress))
      return errResp(id, new ValidationError('Invalid buyer address format', 'buyerAddress'));

    let tokensToBuyBigInt: bigint;
    try {
      tokensToBuyBigInt = BigInt(tokensToBuy);
      if (tokensToBuyBigInt <= 0n) throw new Error();
    } catch {
      return errResp(id, new ValidationError('tokensToBuy must be a positive integer', 'tokensToBuy'));
    }

    try {
      const curveState = await fetchCurveState(instance);
      if (!curveState) return errResp(id, new ContractError('Curve not found or not yet initialized'));

      if (tokensToBuyBigInt > curveState.tokensRemaining)
        return errResp(
          id,
          new ValidationError(
            `Requested ${tokensToBuyBigInt} tokens exceeds available ${curveState.tokensRemaining}`,
            'tokensToBuy',
          ),
        );

      const quote = getBuyQuote(curveState.currentSupply, tokensToBuyBigInt);

      // --- Cashonize / no-extension fallback ---
      // If no signer key is configured, return a BIP-21 URI for the user's wallet
      const signer = loadDemoSigner();
      if (!signer) {
        const uri = buildBchPaymentUri(
          instance.contract.address,
          quote.totalSat,
          `Buy ${tokensToBuyBigInt} tokens`,
          `IgniteBCH bonding curve buy`,
        );
        return NextResponse.json({
          success: true,
          requestId: id,
          mode: 'cashonize',
          paymentUri: uri,
          contractAddress: instance.contract.address,
          quote: {
            tokenAmount: quote.tokenAmount.toString(),
            costSat: quote.costSat.toString(),
            feeSat: quote.feeSat.toString(),
            totalSat: quote.totalSat.toString(),
            priceImpactPercent: quote.priceImpactPercent,
          },
        });
      }

      // --- Paytaca / server-side signing path ---
      // Fetch buyer's UTXOs from the network
      let userUtxos;
      try {
        userUtxos = await provider.getUtxos(buyerAddress);
      } catch (err) {
        throw new NetworkError('Failed to fetch wallet UTXOs', err);
      }

      const userBchUtxos = userUtxos.filter(u => !u.token);
      if (userBchUtxos.length === 0)
        return errResp(id, new InsufficientFundsError('No BCH UTXOs found for buyer address'));

      const totalNeeded = quote.totalSat + 2000n; // buffer for tx fee
      try {
        selectUtxos(userBchUtxos, totalNeeded, false);
      } catch {
        return errResp(
          id,
          new InsufficientFundsError(
            `Insufficient BCH — need at least ${totalNeeded} satoshis`,
            totalNeeded,
          ),
        );
      }

      // Contract enforces: fee >= 546 sat. Validate before building tx.
      const MIN_CONTRACT_FEE = 546n;
      if (quote.feeSat < MIN_CONTRACT_FEE) {
        const minCostSat = MIN_CONTRACT_FEE * 100n; // fee is 1% so min cost = 546*100
        const minCostBch = (Number(minCostSat) / 1e8).toFixed(8);
        return errResp(
          id,
          new ValidationError(
            `Trade too small — minimum cost is ${minCostBch} BCH (contract requires fee ≥ 546 sat). Try buying more tokens.`,
            'tokensToBuy',
          ),
        );
      }

      // Build the full transaction (server-side signing)
      const buyerTokenAddress = toTokenAddress(buyerAddress, network);
      const builder = await buildBuyTransaction(
        instance,
        tokensToBuyBigInt,
        userBchUtxos,
        buyerTokenAddress,  // token destination — must be token-capable address
        buyerAddress,       // BCH change destination
        signer,
      );

      const txHex = await builder.build();
      const txid = await broadcastTransaction(txHex, network);

      return NextResponse.json({
        success: true,
        requestId: id,
        mode: 'paytaca',
        txid,
        explorer: network === 'chipnet'
          ? `https://chipnet.bch.ninja/tx/${txid}`
          : `https://explorer.bitcoin.com/bch/tx/${txid}`,
        quote: {
          tokenAmount: quote.tokenAmount.toString(),
          costSat: quote.costSat.toString(),
          feeSat: quote.feeSat.toString(),
          totalSat: quote.totalSat.toString(),
          priceImpactPercent: quote.priceImpactPercent,
        },
      });
    } catch (err) {
      const appErr = toAppError(err);
      console.error({ requestId: id, action, error: appErr });
      return errResp(id, appErr);
    }
  }

  // ── sell ──────────────────────────────────────────────────────────────────────
  if (action === 'sell') {
    if (!sellerAddress)
      return errResp(id, new ValidationError('Missing sellerAddress', 'sellerAddress'));
    if (!tokensToSell)
      return errResp(id, new ValidationError('Missing tokensToSell', 'tokensToSell'));
    if (!verifyAddress(sellerAddress))
      return errResp(id, new ValidationError('Invalid seller address format', 'sellerAddress'));

    let tokensToSellBigInt: bigint;
    try {
      tokensToSellBigInt = BigInt(tokensToSell);
      if (tokensToSellBigInt <= 0n) throw new Error();
    } catch {
      return errResp(id, new ValidationError('tokensToSell must be a positive integer', 'tokensToSell'));
    }

    try {
      const curveState = await fetchCurveState(instance);
      if (!curveState) return errResp(id, new ContractError('Curve not found or not yet initialized'));

      if (tokensToSellBigInt > curveState.currentSupply)
        return errResp(
          id,
          new ValidationError(
            `Cannot sell ${tokensToSellBigInt} — only ${curveState.currentSupply} in circulation`,
            'tokensToSell',
          ),
        );

      const quote = getSellQuote(curveState.currentSupply, tokensToSellBigInt);

      // --- Cashonize fallback ---
      const signer = loadDemoSigner();
      if (!signer) {
        const uri = buildBchPaymentUri(
          instance.contract.address,
          546n, // dust — user sends tokens back to contract
          `Sell ${tokensToSellBigInt} tokens`,
          `IgniteBCH bonding curve sell`,
        );
        return NextResponse.json({
          success: true,
          requestId: id,
          mode: 'cashonize',
          paymentUri: uri,
          contractAddress: instance.contract.address,
          quote: {
            tokensToSell: tokensToSellBigInt.toString(),
            bchReturnSat: quote.bchReturnSat.toString(),
            feeSat: quote.feeSat.toString(),
            netReturnSat: quote.netReturnSat.toString(),
            priceImpactPercent: quote.priceImpactPercent,
          },
        });
      }

      // --- Server-side signing path ---
      let userUtxos;
      try {
        userUtxos = await provider.getUtxos(sellerAddress);
      } catch (err) {
        throw new NetworkError('Failed to fetch wallet UTXOs', err);
      }

      const userTokenUtxos = userUtxos.filter(
        u => u.token && u.token.category === tokenId && !u.token.nft
      );
      const userBchUtxos = userUtxos.filter(u => !u.token);

      if (userTokenUtxos.length === 0)
        return errResp(id, new InsufficientFundsError('No token UTXOs found for seller address'));
      if (userBchUtxos.length === 0)
        return errResp(id, new InsufficientFundsError('No BCH UTXOs found for fees'));

      const userTokenUtxo = userTokenUtxos.find(u => u.token!.amount >= tokensToSellBigInt);
      if (!userTokenUtxo)
        return errResp(
          id,
          new InsufficientFundsError(
            `Insufficient token balance — need ${tokensToSellBigInt}`,
            tokensToSellBigInt,
          ),
        );

      const sellerTokenAddress = toTokenAddress(sellerAddress, network);
      const builder = await buildSellTransaction(
        instance,
        tokensToSellBigInt,
        userTokenUtxo,
        userBchUtxos[0],
        sellerAddress,
        sellerTokenAddress, // token change destination — must be token-capable
        signer,
      );

      const txHex = await builder.build();
      const txid = await broadcastTransaction(txHex, network);

      return NextResponse.json({
        success: true,
        requestId: id,
        mode: 'paytaca',
        txid,
        explorer: network === 'chipnet'
          ? `https://chipnet.bch.ninja/tx/${txid}`
          : `https://explorer.bitcoin.com/bch/tx/${txid}`,
        quote: {
          tokensToSell: tokensToSellBigInt.toString(),
          bchReturnSat: quote.bchReturnSat.toString(),
          feeSat: quote.feeSat.toString(),
          netReturnSat: quote.netReturnSat.toString(),
          priceImpactPercent: quote.priceImpactPercent,
        },
      });
    } catch (err) {
      const appErr = toAppError(err);
      console.error({ requestId: id, action, error: appErr });
      return errResp(id, appErr);
    }
  }

  // ── broadcast (manual hex) ────────────────────────────────────────────────────
  if (action === 'broadcast') {
    if (!signedTxHex)
      return errResp(id, new ValidationError('Missing signedTxHex', 'signedTxHex'));
    if (typeof signedTxHex !== 'string')
      return errResp(id, new ValidationError('signedTxHex must be a string', 'signedTxHex'));
    if (!/^[0-9a-fA-F]+$/.test(signedTxHex))
      return errResp(id, new ValidationError('signedTxHex is not valid hex', 'signedTxHex'));
    if (signedTxHex.length < 64 || signedTxHex.length > 1_000_000)
      return errResp(id, new ValidationError('signedTxHex length out of range', 'signedTxHex'));

    try {
      const txid = await broadcastTransaction(signedTxHex, network);
      return NextResponse.json({
        success: true,
        requestId: id,
        txid,
        explorer: network === 'chipnet'
          ? `https://chipnet.bch.ninja/tx/${txid}`
          : `https://explorer.bitcoin.com/bch/tx/${txid}`,
      });
    } catch (err) {
      const appErr = toAppError(err);
      console.error({ requestId: id, action, error: appErr });
      return errResp(id, appErr);
    }
  }

  return errResp(id, new ValidationError(`Unknown action: ${action}`, 'action'));
}