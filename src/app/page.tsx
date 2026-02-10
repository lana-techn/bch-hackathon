import { Suspense, memo } from "react";
import { mockTokens } from "@/data/mock-tokens";
import { TokenCard } from "@/components/ui/TokenCard";
import { KingOfTheHill } from "@/components/ui/KingOfTheHill";
import Link from "next/link";

// Memoized filter buttons to prevent re-renders
const FilterButton = memo(function FilterButton({ 
  filter, 
  isActive 
}: { 
  filter: string; 
  isActive: boolean;
}) {
  return (
    <button
      className={`px-3 py-1 font-[family-name:var(--font-heading)] text-xs uppercase tracking-wider border-2 transition-colors ${
        isActive
          ? "border-neon text-neon bg-neon/10"
          : "border-border text-text-dim hover:border-text hover:text-text"
      }`}
    >
      {filter}
    </button>
  );
});

// Memoized stats calculation
const TokenStats = memo(function TokenStats() {
  const totalVolume = mockTokens.reduce((sum, t) => sum + t.volume24hBCH, 0);
  const totalTokens = mockTokens.length;
  const graduatedCount = mockTokens.filter((t) => t.isGraduated).length;

  return (
    <section className="border-b-3 border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-8">
            <div>
              <p className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim">
                Tokens Live
              </p>
              <p className="font-[family-name:var(--font-mono)] text-xl font-bold text-neon tabular-nums">
                {totalTokens}
              </p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim">
                24h Volume
              </p>
              <p className="font-[family-name:var(--font-mono)] text-xl font-bold text-text tabular-nums">
                {totalVolume.toFixed(2)} BCH
              </p>
            </div>
            <div className="w-px h-8 bg-border hidden md:block" />
            <div className="hidden md:block">
              <p className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim">
                Graduated
              </p>
              <p className="font-[family-name:var(--font-mono)] text-xl font-bold text-warn tabular-nums">
                {graduatedCount}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-neon animate-pulse" />
            <span className="font-[family-name:var(--font-mono)] text-xs text-neon">
              LIVE
            </span>
          </div>
        </div>
      </div>
    </section>
  );
});

// Memoized token grid
const TokenGrid = memo(function TokenGrid({ tokens }: { tokens: typeof mockTokens }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tokens.map((token) => (
        <TokenCard key={token.id} token={token} />
      ))}
    </section>
  );
});

// Loading skeleton for KingOfTheHill
function KingOfTheHillSkeleton() {
  return (
    <div className="bg-card border-3 border-border p-6 animate-pulse">
      <div className="h-8 bg-void w-1/3 mb-4" />
      <div className="h-32 bg-void" />
    </div>
  );
}

export default function Home() {
  // Pre-sort tokens once (not on every render)
  const sortedTokens = [...mockTokens].sort(
    (a, b) => b.marketCapBCH - a.marketCapBCH
  );
  const kingToken = sortedTokens[0];
  const otherTokens = sortedTokens.slice(1);

  const filters = ["Trending", "New", "Graduating", "Graduated"];

  return (
    <div className="min-h-screen bg-void">
      {/* Hero Section - Critical above fold */}
      <section className="relative border-b-3 border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
          <div className="max-w-2xl">
            <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-6xl font-bold uppercase leading-tight text-text mb-4">
              Fair Launch
              <br />
              <span className="text-neon">on Bitcoin Cash</span>
            </h1>
            <p className="text-text-dim text-lg md:text-xl mb-8 max-w-lg leading-relaxed">
              Launch CashTokens instantly with bonding curve pricing. No
              presale, no team allocation, 100% safe liquidity.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/create"
                className="brutal-btn bg-neon text-void font-[family-name:var(--font-heading)] font-bold text-sm uppercase tracking-wider px-8 py-3 border-3 border-neon hover:bg-neon/90 transition-colors inline-block"
              >
                Launch Token
              </Link>
              <a
                href="#tokens"
                className="brutal-btn bg-void text-neon font-[family-name:var(--font-heading)] font-bold text-sm uppercase tracking-wider px-8 py-3 border-3 border-neon hover:bg-neon/10 transition-colors inline-block"
              >
                Explore
              </a>
            </div>
          </div>
        </div>

        {/* Decorative grid - CSS only, no image */}
        <div 
          className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#00FFA3 1px, transparent 1px), 
                             linear-gradient(90deg, #00FFA3 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </section>

      {/* Stats Bar */}
      <TokenStats />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8" id="tokens">
        {/* King of the Hill */}
        <Suspense fallback={<KingOfTheHillSkeleton />}>
          <section className="mb-8">
            <KingOfTheHill token={kingToken} />
          </section>
        </Suspense>

        {/* Filter Bar */}
        <section className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-text">
            All Tokens
          </h2>
          <div className="flex gap-2">
            {filters.map((filter, index) => (
              <FilterButton 
                key={filter} 
                filter={filter} 
                isActive={index === 0}
              />
            ))}
          </div>
        </section>

        {/* Token Grid */}
        <TokenGrid tokens={otherTokens} />
      </div>
    </div>
  );
}
