import { mockTokens } from "@/data/mock-tokens";
import { getTradesForToken, getCommentsForToken } from "@/data/mock-tokens";
import { formatBCH, formatNumber, formatPercent, shortenAddress, timeAgo } from "@/lib/format";
import { getGraduationProgress, getReserveBalance, CONSTANTS } from "@/lib/bonding-curve";
import { PriceChart } from "@/components/trading/PriceChart";
import { TradePanel } from "@/components/trading/TradePanel";
import { TradeHistory } from "@/components/trading/TradeHistory";
import { CommentStream } from "@/components/social/CommentStream";
import Link from "next/link";
import { notFound } from "next/navigation";

interface TokenPageProps {
  params: Promise<{ id: string }>;
}

export default async function TokenPage({ params }: TokenPageProps) {
  const { id } = await params;
  const token = mockTokens.find((t) => t.id === id);

  if (!token) {
    notFound();
  }

  const trades = getTradesForToken(token.id);
  const comments = getCommentsForToken(token.id);
  const graduationProgress = (token.marketCapBCH / token.graduationTarget) * 100;
  const isPositive = token.change24h >= 0;

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="font-[family-name:var(--font-mono)] text-sm text-text-dim hover:text-neon transition-colors mb-4 inline-block"
        >
          &larr; Back to tokens
        </Link>

        {/* Token Header */}
        <div className="bg-card border-3 border-border p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Token Avatar */}
              <div className="w-14 h-14 bg-border border-3 border-border flex items-center justify-center flex-shrink-0">
                <span className="font-[family-name:var(--font-heading)] text-neon text-xl font-bold">
                  {token.ticker.slice(0, 2)}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl font-bold uppercase text-text">
                    {token.name}
                  </h1>
                  {token.isGraduated && (
                    <span className="bg-warn text-void font-[family-name:var(--font-heading)] text-xs font-bold uppercase px-2 py-1">
                      GRADUATED
                    </span>
                  )}
                </div>
                <p className="font-[family-name:var(--font-mono)] text-sm text-text-dim">
                  ${token.ticker}
                </p>
              </div>
            </div>

            {/* Price info */}
            <div className="flex items-center gap-6">
              <div>
                <p className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim">
                  Price
                </p>
                <p className="font-[family-name:var(--font-mono)] text-xl font-bold text-text tabular-nums">
                  {token.priceBCH.toExponential(4)} BCH
                </p>
              </div>
              <div>
                <p className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim">
                  24h
                </p>
                <p
                  className={`font-[family-name:var(--font-mono)] text-xl font-bold tabular-nums ${
                    isPositive ? "text-neon" : "text-panic"
                  }`}
                >
                  {formatPercent(token.change24h)}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-4 border-t-2 border-border">
            <div>
              <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                Market Cap
              </p>
              <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-text tabular-nums">
                {formatBCH(token.marketCapBCH, 2)}
              </p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                24h Volume
              </p>
              <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-text tabular-nums">
                {formatBCH(token.volume24hBCH, 2)}
              </p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                Holders
              </p>
              <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-text tabular-nums">
                {formatNumber(token.holders)}
              </p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                Transactions
              </p>
              <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-text tabular-nums">
                {formatNumber(token.txCount)}
              </p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                Creator
              </p>
              <p className="font-[family-name:var(--font-mono)] text-sm text-neon">
                {shortenAddress(token.creatorAddress)}
              </p>
            </div>
          </div>

          {/* Graduation Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-[family-name:var(--font-heading)] uppercase text-text-dim">
                Graduation Progress
              </span>
              <span className="font-[family-name:var(--font-mono)] text-neon tabular-nums">
                {graduationProgress.toFixed(1)}% ({formatBCH(token.marketCapBCH, 2)} / {formatBCH(token.graduationTarget, 0)})
              </span>
            </div>
            <div className="w-full h-3 bg-void border-2 border-border">
              <div
                className="h-full progress-bar transition-all duration-500"
                style={{
                  width: `${Math.min(graduationProgress, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Description */}
          {token.description && (
            <p className="mt-4 text-sm text-text-dim leading-relaxed">
              {token.description}
            </p>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Chart + Trade History */}
          <div className="lg:col-span-2 space-y-6">
            <PriceChart />
            <TradeHistory trades={trades} />
          </div>

          {/* Right: Trade Panel + Chat */}
          <div className="space-y-6">
            <TradePanel
              tokenTicker={token.ticker}
              currentSupplySold={token.currentSupply}
            />
            <CommentStream comments={comments} tokenId={token.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
