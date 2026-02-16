"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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

interface TradePanelProps {
  tokenTicker: string;
  tokenId: string;
  currentSupplySold: number;
}

const SAT_PER_BCH = 100_000_000n;

function satToBch(sat: bigint): string {
  const bch = Number(sat) / 100_000_000;
  return bch.toFixed(8);
}

function bchToSat(bch: number): bigint {
  return BigInt(Math.round(bch * 100_000_000));
}

export function TradePanel({ tokenTicker, tokenId, currentSupplySold }: TradePanelProps) {
  const { wallet, isConnected, signTransaction } = useWallet();
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [inputAmount, setInputAmount] = useState("");
  const [slippage, setSlippage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const supply = BigInt(currentSupplySold);
  const amount = parseFloat(inputAmount) || 0;

  // All calculations use on-chain integer math (BigInt)
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
        const impact = priceBefore > 0
          ? ((priceAfter - priceBefore) / priceBefore) * 100
          : 0;

        return {
          outputAmount: tokens,
          outputDisplay: formatNumber(Number(tokens)),
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
        const impact = priceBefore > 0
          ? Math.abs((priceAfter - priceBefore) / priceBefore) * 100
          : 0;

        return {
          outputAmount: netSat,
          outputDisplay: satToBch(netSat) + " BCH",
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

  const handleTrade = useCallback(async () => {
    if (!isConnected || !wallet) {
      setError("Please connect your wallet first");
      return;
    }

    if (!quote || amount <= 0) {
      setError("Invalid trade amount");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setTxHash(null);

    try {
      // Call API to get curve state and build transaction
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode === 'buy' ? 'buy' : 'sell',
          tokenId,
          tokensToBuy: mode === 'buy' ? quote.outputAmount.toString() : undefined,
          tokensToSell: mode === 'sell' ? Math.round(amount).toString() : undefined,
          buyerAddress: wallet.cashAddress,
          sellerAddress: wallet.cashAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Trade failed');
      }

      // For now, just show success message
      // Full transaction signing requires client-side wallet integration
      setTxHash('pending');
      
      // Reset form on success
      setInputAmount("");
    } catch (err: any) {
      console.error("Trade error:", err);
      setError(err.message || "Trade failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [mode, amount, quote, wallet, isConnected, tokenId]);

  const quickAmountsBuy = [0.01, 0.05, 0.1, 0.5, 1.0];
  const quickAmountsSell = [1000000, 5000000, 10000000, 50000000];

  return (
    <div className="bg-card border-3 border-border">
      {/* Buy / Sell Toggle */}
      <div className="flex">
        <button
          onClick={() => { setMode("buy"); setInputAmount(""); }}
          className={`flex-1 py-3 font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wider transition-colors border-b-3 ${
            mode === "buy"
              ? "bg-neon/10 text-neon border-neon"
              : "bg-void text-text-dim border-border hover:text-text"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => { setMode("sell"); setInputAmount(""); }}
          className={`flex-1 py-3 font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wider transition-colors border-b-3 ${
            mode === "sell"
              ? "bg-panic/10 text-panic border-panic"
              : "bg-void text-text-dim border-border hover:text-text"
          }`}
        >
          Sell
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Contract Info Badge */}
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 bg-neon animate-pulse" />
          <span className="font-[family-name:var(--font-mono)] text-neon">
            On-chain bonding curve (CashScript)
          </span>
        </div>

        {/* Input */}
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
              className="w-full bg-void border-2 border-border focus:border-neon outline-none px-3 py-3 font-[family-name:var(--font-mono)] text-lg text-text tabular-nums placeholder:text-text-dim/30"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-[family-name:var(--font-mono)] text-xs text-text-dim">
              {mode === "buy" ? "BCH" : tokenTicker}
            </span>
          </div>
        </div>

        {/* Quick Amount Buttons */}
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

        {/* Output */}
        <div>
          <label className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim block mb-1">
            {mode === "buy" ? `You Receive (${tokenTicker})` : "You Receive (BCH)"}
          </label>
          <div className="w-full bg-void border-2 border-border px-3 py-3 font-[family-name:var(--font-mono)] text-lg tabular-nums text-neon">
            {quote ? quote.outputDisplay : "0.00"}
          </div>
        </div>

        {/* Trade Details */}
        {quote && (
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="font-[family-name:var(--font-heading)] uppercase text-text-dim">
                Price (sat/token)
              </span>
              <span className="font-[family-name:var(--font-mono)] text-text tabular-nums">
                {quote.priceSat.toString()} sat
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-[family-name:var(--font-heading)] uppercase text-text-dim">
                Fee (1%)
              </span>
              <span className="font-[family-name:var(--font-mono)] text-text tabular-nums">
                {quote.feeDisplay}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-[family-name:var(--font-heading)] uppercase text-text-dim">
                Price Impact
              </span>
              <span
                className={`font-[family-name:var(--font-mono)] tabular-nums ${
                  quote.priceImpact > 5 ? "text-panic" : quote.priceImpact > 2 ? "text-warn" : "text-neon"
                }`}
              >
                {quote.priceImpact.toFixed(2)}%
              </span>
            </div>
          </div>
        )}

        {/* Slippage */}
        <div>
          <label className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim block mb-1">
            Max Slippage
          </label>
          <div className="flex gap-2">
            {[0.5, 1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={`flex-1 py-1 font-[family-name:var(--font-mono)] text-xs border-2 transition-colors ${
                  slippage === s
                    ? "border-neon text-neon bg-neon/10"
                    : "border-border text-text-dim hover:border-text"
                }`}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleTrade}
          disabled={!isConnected || isProcessing || !quote}
          className={`w-full py-4 font-[family-name:var(--font-heading)] text-base font-bold uppercase tracking-wider brutal-btn border-3 transition-colors ${
            mode === "buy"
              ? "bg-neon text-void border-neon hover:bg-neon/90 disabled:opacity-50"
              : "bg-panic text-void border-panic hover:bg-panic/90 disabled:opacity-50"
          }`}
        >
          {isProcessing
            ? "Processing..."
            : !isConnected
              ? "Connect Wallet"
              : mode === "buy"
                ? `Buy ${tokenTicker}`
                : `Sell ${tokenTicker}`}
        </button>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-panic/10 border-2 border-panic text-panic text-sm font-[family-name:var(--font-mono)]">
            {error}
          </div>
        )}

        {/* Success Message */}
        {txHash && (
          <div className="p-3 bg-neon/10 border-2 border-neon text-neon text-sm font-[family-name:var(--font-mono)]">
            Transaction submitted!{" "}
            <a
              href={`https://explorer.bitcoin.com/bch/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              View on explorer
            </a>
          </div>
        )}

        {/* Supply Info */}
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
