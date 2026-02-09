import type { Trade } from "@/types";
import { formatBCH, formatNumber, shortenAddress, timeAgo } from "@/lib/format";

interface TradeHistoryProps {
  trades: Trade[];
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  return (
    <div className="bg-card border-3 border-border">
      <div className="px-4 py-3 border-b-2 border-border">
        <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase text-text-dim">
          Recent Trades
        </h3>
      </div>

      <div className="divide-y divide-border">
        {/* Header */}
        <div className="grid grid-cols-5 gap-2 px-4 py-2 text-xs font-[family-name:var(--font-heading)] uppercase text-text-dim">
          <span>Type</span>
          <span>BCH</span>
          <span>Tokens</span>
          <span>Trader</span>
          <span className="text-right">Time</span>
        </div>

        {trades.map((trade) => (
          <div
            key={trade.id}
            className="grid grid-cols-5 gap-2 px-4 py-2 text-xs hover:bg-void/50 transition-colors"
          >
            <span
              className={`font-[family-name:var(--font-heading)] font-bold uppercase ${
                trade.type === "buy" ? "text-neon" : "text-panic"
              }`}
            >
              {trade.type}
            </span>
            <span className="font-[family-name:var(--font-mono)] text-text tabular-nums">
              {formatBCH(trade.amountBCH, 3)}
            </span>
            <span className="font-[family-name:var(--font-mono)] text-text tabular-nums">
              {formatNumber(trade.amountToken)}
            </span>
            <span className="font-[family-name:var(--font-mono)] text-text-dim">
              {shortenAddress(trade.traderAddress)}
            </span>
            <span className="font-[family-name:var(--font-mono)] text-text-dim text-right">
              {timeAgo(trade.timestamp)}
            </span>
          </div>
        ))}

        {trades.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="font-[family-name:var(--font-mono)] text-sm text-text-dim">
              No trades yet. Be the first!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
