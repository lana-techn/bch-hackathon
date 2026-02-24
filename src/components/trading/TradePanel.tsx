"use client";

import { useState, useMemo, useCallback } from "react";
import {
  calculateBuyCostSat,
  calculateSellReturnSat,
  calculateFeeSat,
  getCurrentPriceSat,
  estimateTokensForBCH,
  CURVE_SUPPLY,
  GRADUATION_TARGET_SAT,
} from "@/lib/contract/constants";
import { formatNumber } from "@/lib/format";
import { useWallet } from "@/components/wallet";
import { openCashonizeWithUri } from "@/lib/bchUri";

interface TradePanelProps {
  tokenTicker: string;
  tokenId: string;
  currentSupplySold: number;
}

const SAT_PER_BCH = 100_000_000n;

function satToBch(sat: bigint): string {
  return (Number(sat) / 100_000_000).toFixed(8);
}

function bchToSat(bch: number): bigint {
  return BigInt(Math.round(bch * 100_000_000));
}

// ─── Step indicators ──────────────────────────────────────────────────────────

type TradeStep = 'idle' | 'confirm' | 'processing' | 'success' | 'cashonize';

export function TradePanel({ tokenTicker, tokenId, currentSupplySold }: TradePanelProps) {
  const { wallet, walletType, isConnected, openCashonizeWeb } = useWallet();
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [inputAmount, setInputAmount] = useState("");
  const [slippage, setSlippage] = useState(1);
  const [step, setStep] = useState<TradeStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isRetryable, setIsRetryable] = useState(false);
  const [txid, setTxid] = useState<string | null>(null);
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
  const [paymentUri, setPaymentUri] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const supply = BigInt(currentSupplySold);
  const amount = parseFloat(inputAmount) || 0;

  // ─── Quote calculation (purely client-side, mirrors on-chain math) ────────────
  const quote = useMemo(() => {
    if (amount <= 0) return null;
    try {
      if (mode === "buy") {
        const bchSat = bchToSat(amount);
        const tokens = estimateTokensForBCH(supply, bchSat);
        if (tokens <= 0n) return null;

        const costSat = calculateBuyCostSat(supply, tokens);
        const feeSat = calculateFeeSat(costSat);
        const totalSat = costSat + feeSat;
        const priceBefore = Number(getCurrentPriceSat(supply));
        const priceAfter = Number(getCurrentPriceSat(supply + tokens));
        const impact = priceBefore > 0 ? ((priceAfter - priceBefore) / priceBefore) * 100 : 0;

        return {
          outputAmount: tokens,
          outputDisplay: formatNumber(Number(tokens)),
          totalSat,
          feeSat,
          feeDisplay: satToBch(feeSat) + " BCH",
          priceImpact: impact,
          priceSat: getCurrentPriceSat(supply),
        };
      } else {
        const tokensToSell = BigInt(Math.round(amount));
        if (tokensToSell <= 0n || tokensToSell > supply) return null;

        const returnSat = calculateSellReturnSat(supply, tokensToSell);
        const feeSat = calculateFeeSat(returnSat);
        const netSat = returnSat - feeSat;
        const priceBefore = Number(getCurrentPriceSat(supply));
        const priceAfter = Number(getCurrentPriceSat(supply - tokensToSell));
        const impact = priceBefore > 0 ? Math.abs((priceAfter - priceBefore) / priceBefore) * 100 : 0;

        return {
          outputAmount: netSat,
          outputDisplay: satToBch(netSat) + " BCH",
          totalSat: 546n, // dust for sell (user sends tokens)
          feeSat,
          feeDisplay: satToBch(feeSat) + " BCH",
          priceImpact: impact,
          priceSat: getCurrentPriceSat(supply),
        };
      }
    } catch {
      return null;
    }
  }, [mode, amount, supply]);

  // ─── Reset state on mode switch ────────────────────────────────────────────────
  const switchMode = (newMode: "buy" | "sell") => {
    setMode(newMode);
    setInputAmount("");
    setStep('idle');
    setError(null);
    setIsRetryable(false);
    setTxid(null);
    setPaymentUri(null);
  };

  // ─── Core trade handler ────────────────────────────────────────────────────────
  const executeTrade = useCallback(async () => {
    if (!isConnected || !wallet) {
      setError("Please connect your wallet first");
      return;
    }
    if (!quote || amount <= 0) {
      setError("Enter a valid amount");
      return;
    }

    setStep('processing');
    setError(null);
    setIsRetryable(false);
    setTxid(null);
    setPaymentUri(null);
    setRequestId(null);

    try {
      const body =
        mode === 'buy'
          ? {
            action: 'buy',
            tokenId,
            tokensToBuy: quote.outputAmount.toString(),
            buyerAddress: wallet.cashAddress,
          }
          : {
            action: 'sell',
            tokenId,
            tokensToSell: Math.round(amount).toString(),
            sellerAddress: wallet.cashAddress,
          };

      const res = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.requestId) setRequestId(data.requestId);

      if (!res.ok || !data.success) {
        setIsRetryable(data.retryable === true);
        throw new Error(data.error || 'Trade failed');
      }

      // ── Cashonize mode: API returned a payment URI ──────────────────────────
      if (data.mode === 'cashonize') {
        setPaymentUri(data.paymentUri);
        setStep('cashonize');
        return;
      }

      // ── Paytaca mode: API signed + broadcast, return txid ──────────────────
      setTxid(data.txid);
      setExplorerUrl(data.explorer || null);
      setStep('success');
      setInputAmount("");

    } catch (err: any) {
      console.error("Trade error:", err);
      setError(err.message || "Trade failed. Please try again.");
      setStep('idle');
    }
  }, [mode, amount, quote, wallet, isConnected, tokenId]);

  // ─── Open Cashonize with payment URI ──────────────────────────────────────────
  const openCashonizePayment = () => {
    if (paymentUri) {
      openCashonizeWithUri(paymentUri);
    }
  };

  const isProcessing = step === 'processing';
  const quickAmountsBuy = [0.01, 0.05, 0.1, 0.5, 1.0];
  const quickAmountsSell = [1_000_000, 5_000_000, 10_000_000, 50_000_000];

  // ─── Wallet type badge ────────────────────────────────────────────────────────
  const walletBadge =
    walletType === 'paytaca'
      ? { label: 'Paytaca (extension)', color: 'text-neon', dot: 'bg-neon' }
      : walletType === 'cashonize'
        ? { label: 'Cashonize (web)', color: 'text-warn', dot: 'bg-warn' }
        : null;

  return (
    <div className="bg-card border-3 border-border">
      {/* ── Buy / Sell Toggle ─────────────────────────────────────────────────── */}
      <div className="flex">
        <button
          onClick={() => switchMode("buy")}
          className={`flex-1 py-3 font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wider transition-colors border-b-3 ${mode === "buy"
            ? "bg-neon/10 text-neon border-neon"
            : "bg-void text-text-dim border-border hover:text-text"
            }`}
        >
          Buy
        </button>
        <button
          onClick={() => switchMode("sell")}
          className={`flex-1 py-3 font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wider transition-colors border-b-3 ${mode === "sell"
            ? "bg-panic/10 text-panic border-panic"
            : "bg-void text-text-dim border-border hover:text-text"
            }`}
        >
          Sell
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* ── Contract badge ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-neon animate-pulse" />
            <span className="font-[family-name:var(--font-mono)] text-neon">
              On-chain bonding curve (CashScript)
            </span>
          </div>
          {walletBadge && (
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${walletBadge.dot}`} />
              <span className={`font-[family-name:var(--font-mono)] text-[10px] ${walletBadge.color}`}>
                {walletBadge.label}
              </span>
            </div>
          )}
        </div>

        {/* ── Input ──────────────────────────────────────────────────────────── */}
        <div>
          <label className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim block mb-1">
            {mode === "buy" ? "You Pay (BCH)" : `You Sell (${tokenTicker})`}
          </label>
          <div className="relative">
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder="0.00"
              disabled={isProcessing}
              className="w-full bg-void border-2 border-border focus:border-neon outline-none px-3 py-3 font-[family-name:var(--font-mono)] text-lg text-text tabular-nums placeholder:text-text-dim/30 disabled:opacity-50"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-[family-name:var(--font-mono)] text-xs text-text-dim">
              {mode === "buy" ? "BCH" : tokenTicker}
            </span>
          </div>
        </div>

        {/* ── Quick amounts ────────────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap">
          {(mode === "buy" ? quickAmountsBuy : quickAmountsSell).map((qa) => (
            <button
              key={qa}
              onClick={() => setInputAmount(qa.toString())}
              className="bg-void border-2 border-border hover:border-neon px-3 py-1 font-[family-name:var(--font-mono)] text-xs text-text-dim hover:text-neon transition-colors"
            >
              {mode === "buy" ? `${qa} BCH` : formatNumber(qa)}
            </button>
          ))}
        </div>

        {/* ── Output ──────────────────────────────────────────────────────── */}
        <div>
          <label className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim block mb-1">
            {mode === "buy" ? `You Receive (${tokenTicker})` : "You Receive (BCH)"}
          </label>
          <div className="w-full bg-void border-2 border-border px-3 py-3 font-[family-name:var(--font-mono)] text-lg tabular-nums text-neon">
            {quote ? quote.outputDisplay : "0.00"}
          </div>
        </div>

        {/* ── Trade details ──────────────────────────────────────────────── */}
        {quote && (
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="font-[family-name:var(--font-heading)] uppercase text-text-dim">Price (sat/token)</span>
              <span className="font-[family-name:var(--font-mono)] text-text tabular-nums">
                {quote.priceSat.toString()} sat
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-[family-name:var(--font-heading)] uppercase text-text-dim">Fee (1%)</span>
              <span className="font-[family-name:var(--font-mono)] text-text tabular-nums">{quote.feeDisplay}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-[family-name:var(--font-heading)] uppercase text-text-dim">Price Impact</span>
              <span
                className={`font-[family-name:var(--font-mono)] tabular-nums ${quote.priceImpact > 5 ? "text-panic" : quote.priceImpact > 2 ? "text-warn" : "text-neon"
                  }`}
              >
                {quote.priceImpact.toFixed(2)}%
              </span>
            </div>
            {mode === 'buy' && (
              <div className="flex justify-between">
                <span className="font-[family-name:var(--font-heading)] uppercase text-text-dim">Total Cost</span>
                <span className="font-[family-name:var(--font-mono)] text-text tabular-nums">
                  {satToBch(quote.totalSat)} BCH
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Slippage ────────────────────────────────────────────────────── */}
        <div>
          <label className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim block mb-1">
            Max Slippage
          </label>
          <div className="flex gap-2">
            {[0.5, 1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={`flex-1 py-1 font-[family-name:var(--font-mono)] text-xs border-2 transition-colors ${slippage === s
                  ? "border-neon text-neon bg-neon/10"
                  : "border-border text-text-dim hover:border-text"
                  }`}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>

        {/* ── Submit button ──────────────────────────────────────────────── */}
        {step !== 'cashonize' && step !== 'success' && (
          <button
            onClick={executeTrade}
            disabled={!isConnected || isProcessing || !quote}
            className={`relative w-full py-4 font-[family-name:var(--font-heading)] text-base font-bold uppercase tracking-wider brutal-btn border-3 transition-colors ${mode === "buy"
              ? "bg-neon text-void border-neon hover:bg-neon/90 disabled:opacity-50"
              : "bg-panic text-void border-panic hover:bg-panic/90 disabled:opacity-50"
              }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-void/40 border-t-void rounded-full animate-spin" />
                Signing & Broadcasting...
              </span>
            ) : !isConnected ? (
              "Connect Wallet"
            ) : mode === "buy" ? (
              `Buy ${tokenTicker}`
            ) : (
              `Sell ${tokenTicker}`
            )}
          </button>
        )}

        {/* ── Error panel ────────────────────────────────────────────────── */}
        {error && (
          <div className="p-3 bg-panic/10 border-2 border-panic space-y-2">
            <p className="text-panic text-sm font-[family-name:var(--font-mono)]">{error}</p>
            {requestId && (
              <p className="text-panic/40 text-[10px] font-[family-name:var(--font-mono)] truncate">
                ref: {requestId}
              </p>
            )}
            {isRetryable && (
              <button
                onClick={executeTrade}
                disabled={isProcessing}
                className="w-full py-1.5 text-xs font-[family-name:var(--font-heading)] uppercase tracking-wider border-2 border-panic text-panic hover:bg-panic/20 transition-colors disabled:opacity-50"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* ── Cashonize payment panel ─────────────────────────────────────── */}
        {step === 'cashonize' && paymentUri && (
          <div className="p-3 bg-warn/10 border-2 border-warn space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-warn animate-pulse" />
              <p className="text-warn font-[family-name:var(--font-heading)] text-xs uppercase font-bold tracking-wider">
                Complete in Cashonize
              </p>
            </div>
            <p className="text-text-dim text-xs font-[family-name:var(--font-mono)]">
              Your trade is ready. Click below to open Cashonize and confirm the payment.
            </p>
            <button
              onClick={openCashonizePayment}
              className="w-full py-3 bg-warn text-void font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wider border-2 border-warn hover:bg-warn/90 transition-colors"
            >
              Open Cashonize →
            </button>
            <button
              onClick={() => setStep('idle')}
              className="w-full py-1 text-xs font-[family-name:var(--font-heading)] uppercase tracking-wider text-text-dim hover:text-text border-2 border-border hover:border-text transition-colors"
            >
              Cancel
            </button>
            {requestId && (
              <p className="text-warn/40 text-[10px] font-[family-name:var(--font-mono)] truncate">
                ref: {requestId}
              </p>
            )}
          </div>
        )}

        {/* ── Success panel ───────────────────────────────────────────────── */}
        {step === 'success' && txid && (
          <div className="p-3 bg-neon/10 border-2 border-neon space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-neon" />
              <p className="text-neon font-[family-name:var(--font-heading)] text-xs uppercase font-bold tracking-wider">
                Transaction Submitted!
              </p>
            </div>
            <p className="font-[family-name:var(--font-mono)] text-[10px] text-text-dim break-all">
              txid: {txid}
            </p>
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-neon text-xs font-[family-name:var(--font-mono)] underline hover:no-underline"
              >
                View on blockchain explorer →
              </a>
            )}
            {requestId && (
              <p className="text-neon/40 text-[10px] font-[family-name:var(--font-mono)] truncate">
                ref: {requestId}
              </p>
            )}
            <a
              href={`https://x.com/intent/tweet?text=${encodeURIComponent(
                `Just ${mode === 'buy' ? 'bought' : 'sold'} $${tokenTicker} on @bch_hacks! 🚀\n\nCheck it out here:`
              )}&url=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/token/${tokenId}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full brutal-btn flex items-center justify-center gap-2 bg-[#000000] text-white font-[family-name:var(--font-heading)] uppercase tracking-wider font-bold py-2 border-2 border-[#000000] hover:bg-[#000000]/80 transition-colors text-xs mt-2"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.004 3.936H5.021z" />
              </svg>
              Share on X
            </a>
            <button
              onClick={() => { setStep('idle'); setTxid(null); }}
              className="w-full py-1.5 text-xs font-[family-name:var(--font-heading)] uppercase tracking-wider border-2 border-neon text-neon hover:bg-neon/10 transition-colors mt-2"
            >
              Trade Again
            </button>
          </div>
        )}

        {/* ── Not connected helper ────────────────────────────────────────── */}
        {!isConnected && (
          <p className="text-center text-xs font-[family-name:var(--font-mono)] text-text-dim">
            Connect <span className="text-neon">Paytaca</span> extension or{" "}
            <button
              onClick={openCashonizeWeb}
              className="text-warn underline hover:no-underline"
            >
              Cashonize
            </button>{" "}
            web wallet to trade
          </p>
        )}

        {/* ── Supply info ─────────────────────────────────────────────────── */}
        <div className="text-center space-y-1">
          <p className="font-[family-name:var(--font-mono)] text-xs text-text-dim tabular-nums">
            {formatNumber(currentSupplySold)} / {formatNumber(Number(CURVE_SUPPLY))} tokens sold
          </p>
          <p className="font-[family-name:var(--font-mono)] text-[10px] text-text-dim">
            Graduation at {Number(GRADUATION_TARGET_SAT / SAT_PER_BCH)} BCH reserve
          </p>
        </div>
      </div>
    </div>
  );
}
