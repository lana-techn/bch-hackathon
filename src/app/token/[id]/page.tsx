import { Suspense, memo } from "react";
import dynamic from "next/dynamic";
import { mockTokens } from "@/data/mock-tokens";
import { getTradesForToken, getCommentsForToken } from "@/data/mock-tokens";
import { formatBCH, formatNumber, formatPercent, shortenAddress } from "@/lib/format";
import { TradePanel } from "@/components/trading/TradePanel";
import { TokenPerformanceStats } from "@/components/trading/TokenPerformanceStats";
import Link from "next/link";
import { notFound } from "next/navigation";

// Lazy load heavy chart components
const TradingViewChart = dynamic(
  () => import("@/components/trading/TradingViewChart").then(mod => ({ default: mod.TradingViewChart })),
  { 
    loading: () => <ChartSkeleton height={350} />,
  }
);

const VolumeChart = dynamic(
  () => import("@/components/trading/VolumeChart").then(mod => ({ default: mod.VolumeChart })),
  { 
    loading: () => <ChartSkeleton height={180} />,
  }
);

const TradeHistory = dynamic(
  () => import("@/components/trading/TradeHistory").then(mod => ({ default: mod.TradeHistory })),
  { 
    loading: () => <div className="h-64 bg-card border-3 border-border animate-pulse" />,
  }
);

const CommentStream = dynamic(
  () => import("@/components/social/CommentStream").then(mod => ({ default: mod.CommentStream })),
  { 
    loading: () => <div className="h-80 bg-card border-3 border-border animate-pulse" />,
  }
);

const Web3CommentStream = dynamic(
  () => import("@/components/web3").then(mod => ({ default: mod.Web3CommentStream })),
  { 
    loading: () => <div className="h-80 bg-card border-3 border-border animate-pulse" />,
  }
);

// Loading skeleton for charts
function ChartSkeleton({ height }: { height: number }) {
  return (
    <div 
      className="bg-card border-3 border-border animate-pulse flex items-center justify-center"
      style={{ height }}
    >
      <div className="w-8 h-8 border-4 border-neon border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Memoized stat item
const StatItem = memo(function StatItem({ 
  label, 
  value 
}: { 
  label: string; 
  value: string;
}) {
  return (
    <div className="p-4 border-r-2 border-border last:border-r-0">
      <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim mb-1">
        {label}
      </p>
      <p className="font-[family-name:var(--font-mono)] text-xl font-bold text-text tabular-nums">
        {value}
      </p>
    </div>
  );
});

// Token header component
const TokenHeader = memo(function TokenHeader({ 
  token, 
  graduationProgress, 
  isPositive, 
  supplyPercentage 
}: { 
  token: typeof mockTokens[0];
  graduationProgress: number;
  isPositive: boolean;
  supplyPercentage: number;
}) {
  return (
    <div className="bg-card border-3 border-border mb-6">
      {/* Top Section - Token Identity & Price */}
      <div className="p-4 md:p-6 border-b-2 border-border">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Token Info */}
          <div className="flex items-center gap-4">
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

          {/* Right: Price & Change */}
          <div className="flex items-center gap-8">
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
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-b-2 border-border">
        <StatItem label="Market Cap" value={formatBCH(token.marketCapBCH, 2)} />
        <StatItem label="24h Volume" value={formatBCH(token.volume24hBCH, 2)} />
        <StatItem label="Holders" value={formatNumber(token.holders)} />
        <StatItem label="Supply Sold" value={`${supplyPercentage.toFixed(1)}%`} />
        <StatItem label="Transactions" value={formatNumber(token.txCount)} />
        <StatItem label="Graduation" value={`${graduationProgress.toFixed(1)}%`} />
      </div>

      {/* Graduation Progress & Description */}
      <div className="p-4 md:p-6 space-y-4">
        <div>
          <div className="w-full h-4 bg-void border-2 border-border">
            <div
              className="h-full progress-bar transition-all duration-500"
              style={{ width: `${Math.min(graduationProgress, 100)}%` }}
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

        {token.description && (
          <p className="text-sm text-text-dim leading-relaxed border-t-2 border-border pt-4">
            {token.description}
          </p>
        )}
      </div>
    </div>
  );
});

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
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="font-[family-name:var(--font-mono)] text-sm text-text-dim hover:text-neon transition-colors mb-4 inline-block"
        >
          &larr; Back to tokens
        </Link>

        {/* Token Header */}
        <TokenHeader 
          token={token}
          graduationProgress={graduationProgress}
          isPositive={isPositive}
          supplyPercentage={supplyPercentage}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts & History */}
          <div className="lg:col-span-2 space-y-6">
            <Suspense fallback={<ChartSkeleton height={350} />}>
              <TradingViewChart />
            </Suspense>
            
            <Suspense fallback={<ChartSkeleton height={180} />}>
              <VolumeChart />
            </Suspense>
            
            <Suspense fallback={<div className="h-64 bg-card border-3 border-border animate-pulse" />}>
              <TradeHistory trades={trades} />
            </Suspense>
          </div>

          {/* Right Column - Stats, Trading & Chat */}
          <div className="space-y-6">
            <div className="lg:sticky lg:top-20">
              <TradePanel
                tokenTicker={token.ticker}
                tokenId={token.id}
                currentSupplySold={token.currentSupply}
              />
            </div>
            
            <TokenPerformanceStats token={token} />
            
            <Suspense fallback={<div className="h-80 bg-card border-3 border-border animate-pulse" />}>
              <Web3CommentStream tokenId={token.id} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
