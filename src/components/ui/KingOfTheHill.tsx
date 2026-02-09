import Link from "next/link";
import type { Token } from "@/types";
import { formatBCH, formatPercent } from "@/lib/format";

interface KingOfTheHillProps {
  token: Token;
}

export function KingOfTheHill({ token }: KingOfTheHillProps) {
  const graduationProgress =
    (token.marketCapBCH / token.graduationTarget) * 100;

  return (
    <Link href={`/token/${token.id}`}>
      <div className="relative bg-card border-3 border-warn brutal-shadow overflow-hidden cursor-pointer group scanlines">
        {/* Crown Banner */}
        <div className="bg-warn text-void px-4 py-2 flex items-center gap-2">
          <span className="text-lg">&#9813;</span>
          <span className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-widest">
            King of the Hill
          </span>
          <span className="text-lg">&#9813;</span>
        </div>

        <div className="p-6 relative z-20">
          <div className="flex items-center gap-4 mb-4">
            {/* Token Image Placeholder */}
            <div className="w-16 h-16 bg-border border-3 border-warn flex items-center justify-center">
              <span className="font-[family-name:var(--font-heading)] text-warn text-2xl font-bold">
                {token.ticker.slice(0, 2)}
              </span>
            </div>

            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-text group-hover:text-warn transition-colors">
                {token.name}
              </h2>
              <p className="font-[family-name:var(--font-mono)] text-sm text-text-dim">
                ${token.ticker}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim">
                Market Cap
              </p>
              <p className="font-[family-name:var(--font-mono)] text-lg font-bold text-text tabular-nums">
                {formatBCH(token.marketCapBCH, 2)}
              </p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim">
                24h Change
              </p>
              <p
                className={`font-[family-name:var(--font-mono)] text-lg font-bold tabular-nums ${
                  token.change24h >= 0 ? "text-neon" : "text-panic"
                }`}
              >
                {formatPercent(token.change24h)}
              </p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim">
                Volume
              </p>
              <p className="font-[family-name:var(--font-mono)] text-lg font-bold text-text tabular-nums">
                {formatBCH(token.volume24hBCH, 2)}
              </p>
            </div>
          </div>

          {/* Graduation Progress */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-[family-name:var(--font-heading)] uppercase text-text-dim">
                Graduation Progress
              </span>
              <span className="font-[family-name:var(--font-mono)] text-warn tabular-nums">
                {graduationProgress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-3 bg-void border-2 border-warn">
              <div
                className="h-full bg-warn transition-all duration-500"
                style={{ width: `${Math.min(graduationProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
