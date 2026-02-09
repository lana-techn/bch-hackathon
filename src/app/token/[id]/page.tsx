import { mockTokens } from "@/data/mock-tokens";
import { getTradesForToken, getCommentsForToken } from "@/data/mock-tokens";
import { formatBCH, formatNumber, formatPercent, shortenAddress } from "@/lib/format";
import { PriceChart } from "@/components/trading/PriceChart";
import { TradePanel } from "@/components/trading/TradePanel";
import { TradeHistory } from "@/components/trading/TradeHistory";
import { CommentStream } from "@/components/social/CommentStream";
import { TokenPerformanceStats } from "@/components/trading/TokenPerformanceStats";
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
  const supplyPercentage = (token.currentSupply / token.totalSupply) * 100;

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

        {/* Token Header Card */}
        <div className="bg-card border-3 border-border mb-6">
          {/* Top Section */}
          <div className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left: Token Info */}
              <div className="flex items-center gap-4">
                {/* Token Avatar */}
                <div className="w-16 h-16 bg-border border-3 border-border flex items-center justify-center flex-shrink-0">
                  <span className="font-[family-name:var(--font-heading)] text-neon text-2xl font-bold">
                    {token.ticker.slice(0, 2)}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl font-bold uppercase text-text">
                      {token.name}
                    </h1>
                    <span className="font-[family-name:var(--font-mono)] text-lg text-text-dim">
                      ${token.ticker}
                    </span>
                    {token.isGraduated && (
                      <span className="bg-warn text-void font-[family-name:var(--font-heading)] text-xs font-bold uppercase px-2 py-1">
                        GRADUATED
                      </span>
                    )}
                    {token.category && (
                      <span className="border border-border font-[family-name:var(--font-heading)] text-xs uppercase px-2 py-1 text-text-dim">
                        {token.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs">
                    <span className="font-[family-name:var(--font-mono)] text-text-dim">
                      Created {new Date(token.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-[family-name:var(--font-mono)] text-neon">
                      by {shortenAddress(token.creatorAddress)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Price Info */}
              <div className="flex items-center gap-6 md:gap-8">
                <div className="text-right">
                  <p className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim">
                    Current Price
                  </p>
                  <p className="font-[family-name:var(--font-mono)] text-2xl font-bold text-text tabular-nums">
                    {token.priceBCH.toExponential(4)} BCH
                  </p>
                  <p className="font-[family-name:var(--font-mono)] text-xs text-text-dim">
                    ${token.priceUSD.toFixed(8)} USD
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim">
                    24h Change
                  </p>
                  <p
                    className={`font-[family-name:var(--font-mono)] text-2xl font-bold tabular-nums ${
                      isPositive ? "text-neon" : "text-panic"
                    }`}
                  >
                    {formatPercent(token.change24h)}
                  </p>
                  {token.change7d && (
                    <p className={`font-[family-name:var(--font-mono)] text-xs ${
                      token.change7d >= 0 ? "text-neon" : "text-panic"
                    }`}>
                      7d: {formatPercent(token.change7d)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6 pt-6 border-t-2 border-border">
              <div>
                <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                  Market Cap
                </p>
                <p className="font-[family-name:var(--font-mono)] text-lg font-bold text-text tabular-nums">
                  {formatBCH(token.marketCapBCH, 2)}
                </p>
              </div>
              <div>
                <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                  24h Volume
                </p>
                <p className="font-[family-name:var(--font-mono)] text-lg font-bold text-text tabular-nums">
                  {formatBCH(token.volume24hBCH, 2)}
                </p>
              </div>
              <div>
                <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                  Holders
                </p>
                <p className="font-[family-name:var(--font-mono)] text-lg font-bold text-text tabular-nums">
                  {formatNumber(token.holders)}
                </p>
              </div>
              <div>
                <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                  Supply Sold
                </p>
                <p className="font-[family-name:var(--font-mono)] text-lg font-bold text-text tabular-nums">
                  {supplyPercentage.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                  Tx Count
                </p>
                <p className="font-[family-name:var(--font-mono)] text-lg font-bold text-text tabular-nums">
                  {formatNumber(token.txCount)}
                </p>
              </div>
              <div>
                <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                  Progress
                </p>
                <p className="font-[family-name:var(--font-mono)] text-lg font-bold text-warn tabular-nums">
                  {graduationProgress.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Graduation Progress Bar */}
          <div className="px-4 md:px-6 pb-4 md:pb-6">
            <div className="w-full h-4 bg-void border-2 border-border">
              <div
                className="h-full progress-bar transition-all duration-500"
                style={{
                  width: `${Math.min(graduationProgress, 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className="font-[family-name:var(--font-heading)] text-text-dim uppercase">
                Bonding Curve Progress
              </span>
              <span className="font-[family-name:var(--font-mono)] text-text-dim">
                {formatBCH(token.marketCapBCH, 2)} / {formatBCH(token.graduationTarget, 0)} BCH
              </span>
            </div>
          </div>

          {/* Description */}
          {token.description && (
            <div className="px-4 md:px-6 pb-4 md:pb-6 border-t-2 border-border pt-4">
              <p className="text-sm text-text-dim leading-relaxed">
                {token.description}
              </p>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column: Chart + Trade History */}
          <div className="xl:col-span-2 space-y-6">
            <PriceChart />
            <TradeHistory trades={trades} />
          </div>

          {/* Middle Column: Performance Stats */}
          <div className="space-y-6">
            <TokenPerformanceStats token={token} />
          </div>

          {/* Right Column: Trade Panel + Chat */}
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
