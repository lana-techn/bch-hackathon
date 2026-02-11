'use client';

import Link from "next/link";
import type { Token } from "@/types";
import { formatBCH, formatPercent, formatNumber } from "@/lib/format";
import { useTokenLikes } from "@/hooks/useWeb3Database";

interface TokenCardProps {
  token: Token;
}

export function TokenCard({ token }: TokenCardProps) {
  const isPositive = token.change24h >= 0;
  const graduationProgress =
    (token.marketCapBCH / token.graduationTarget) * 100;
  
  // Get likes count
  const { likes, loading } = useTokenLikes(token.id);

  return (
    <Link href={`/token/${token.id}`}>
      <div className="relative bg-card border-3 border-border hover:border-neon brutal-shadow hover:brutal-shadow-neon transition-all duration-150 cursor-pointer group overflow-hidden">
        {/* Graduated Badge */}
        {token.isGraduated && (
          <div className="absolute top-0 right-0 bg-warn text-void font-[family-name:var(--font-heading)] text-xs font-bold uppercase px-2 py-1 z-10">
            GRADUATED
          </div>
        )}

        {/* Token Header */}
        <div className="p-4 flex items-start gap-3">
          {/* Token Image Placeholder */}
          <div className="w-12 h-12 bg-border border-2 border-border flex-shrink-0 flex items-center justify-center overflow-hidden">
            <span className="font-[family-name:var(--font-heading)] text-neon text-lg font-bold">
              {token.ticker.slice(0, 2)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-[family-name:var(--font-heading)] text-base font-bold uppercase text-text truncate group-hover:text-neon transition-colors">
                {token.name}
              </h3>
              <span
                className={`font-[family-name:var(--font-mono)] text-sm font-bold tabular-nums ${
                  isPositive ? "text-neon" : "text-panic"
                }`}
              >
                {formatPercent(token.change24h)}
              </span>
            </div>
            <p className="font-[family-name:var(--font-mono)] text-xs text-text-dim">
              ${token.ticker}
            </p>
          </div>
        </div>

        {/* Price & Stats */}
        <div className="px-4 pb-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="font-[family-name:var(--font-mono)] text-sm text-text tabular-nums">
              {formatBCH(token.marketCapBCH, 2)}
            </span>
            <span className="font-[family-name:var(--font-mono)] text-xs text-text-dim tabular-nums">
              MCap
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-text-dim">
            <span className="font-[family-name:var(--font-mono)] tabular-nums">
              {formatNumber(token.holders)} holders
            </span>
            <span className="font-[family-name:var(--font-mono)] tabular-nums">
              Vol: {formatBCH(token.volume24hBCH, 2)}
            </span>
          </div>
        </div>

        {/* Graduation Progress Bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-[family-name:var(--font-heading)] uppercase text-text-dim">
              Graduation
            </span>
            <span className="font-[family-name:var(--font-mono)] text-neon tabular-nums">
              {graduationProgress.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2 bg-void border border-border">
            <div
              className="h-full progress-bar transition-all duration-500"
              style={{ width: `${Math.min(graduationProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Likes Indicator */}
        <div className="px-4 pb-4 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-panic-red">
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="font-[family-name:var(--font-mono)] text-xs font-bold">
                {loading ? '...' : likes}
              </span>
            </div>
            <span className="font-[family-name:var(--font-mono)] text-[10px] text-text-dim uppercase">
              Likes
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
