'use client';

import { memo, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { mockTokens } from "@/data/mock-tokens";
import { getAllTokens } from "@/lib/launched-tokens";
import { TokenCard } from "@/components/ui/TokenCard";
import { KingOfTheHill } from "@/components/ui/KingOfTheHill";
import { SmoothScroll } from "@/components/providers";
import { FeaturesSection, HowItWorksSection, StatsSection, CTASection } from "@/components/sections";
import { FadeInSection, ParallaxSection, StaggerContainer } from "@/components/animations";

type FilterType = "Trending" | "New" | "Graduating" | "Graduated";

// Memoized components
const FilterButton = memo(function FilterButton({
  filter,
  isActive,
  onClick,
}: {
  filter: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 font-[family-name:var(--font-heading)] text-xs uppercase tracking-wider border-2 transition-colors ${isActive
          ? "border-neon text-neon bg-neon/10"
          : "border-border text-text-dim hover:border-text hover:text-text"
        }`}
    >
      {filter}
    </button>
  );
});

const TokenStats = memo(function TokenStats({
  totalTokens,
  graduatedCount,
  graduatingCount
}: {
  totalTokens: number;
  graduatedCount: number;
  graduatingCount: number;
}) {
  const displayTokens = mockTokens.slice(0, 6);
  const totalVolume = displayTokens.reduce((sum, t) => sum + t.volume24hBCH, 0);

  return (
    <section className="border-b-3 border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-8">
            <div>
              <p className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim">
                Total Tokens
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
            <div className="w-px h-8 bg-border hidden lg:block" />
            <div className="hidden lg:block">
              <p className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim">
                Graduating
              </p>
              <p className="font-[family-name:var(--font-mono)] text-xl font-bold text-neon tabular-nums">
                {graduatingCount}
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

const TokenGrid = memo(function TokenGrid({ tokens }: { tokens: typeof mockTokens }) {
  if (tokens.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-border">
        <p className="text-text-dim font-mono">No tokens found</p>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tokens.map((token) => (
        <TokenCard key={token.id} token={token} />
      ))}
    </section>
  );
});

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("Trending");
  const filters: FilterType[] = ["Trending", "New", "Graduating", "Graduated"];
  const [allTokens, setAllTokens] = useState(mockTokens);

  // Load launched tokens from localStorage on mount
  useEffect(() => {
    setAllTokens(getAllTokens(mockTokens));
  }, []);

  // Calculate graduation progress for each token
  const tokensWithProgress = useMemo(() => {
    return allTokens.map(token => ({
      ...token,
      graduationProgress: (token.marketCapBCH / token.graduationTarget) * 100
    }));
  }, [allTokens]);

  // Filter and sort tokens based on active filter
  const filteredTokens = useMemo(() => {
    switch (activeFilter) {
      case "Trending":
        // Sort by 24h volume (highest first) or positive change
        return [...tokensWithProgress]
          .sort((a, b) => b.volume24hBCH - a.volume24hBCH)
          .slice(0, 6);

      case "New":
        // Sort by creation date (newest first)
        return [...tokensWithProgress]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 6);

      case "Graduating":
        // Tokens with 50-99% graduation progress and not graduated
        return tokensWithProgress
          .filter(t => t.graduationProgress >= 50 && t.graduationProgress < 100 && !t.isGraduated)
          .sort((a, b) => b.graduationProgress - a.graduationProgress)
          .slice(0, 6);

      case "Graduated":
        // Only graduated tokens
        return tokensWithProgress
          .filter(t => t.isGraduated)
          .sort((a, b) => b.marketCapBCH - a.marketCapBCH)
          .slice(0, 6);

      default:
        return tokensWithProgress.slice(0, 6);
    }
  }, [activeFilter, tokensWithProgress]);

  // King of the Hill - highest market cap
  const kingToken = useMemo(() => {
    return [...allTokens].sort((a, b) => b.marketCapBCH - a.marketCapBCH)[0];
  }, [allTokens]);

  // Stats
  const graduatedCount = allTokens.filter(t => t.isGraduated).length;
  const graduatingCount = allTokens.filter(t => {
    const progress = (t.marketCapBCH / t.graduationTarget) * 100;
    return progress >= 50 && progress < 100 && !t.isGraduated;
  }).length;

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-void">
        {/* Hero Section */}
        <ParallaxSection speed={0.3} className="relative">
          <section className="relative border-b-3 border-border overflow-hidden min-h-[80vh] flex items-center">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 w-full">
              <FadeInSection>
                <div className="max-w-2xl">
                  <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-6xl lg:text-7xl font-bold uppercase leading-tight text-text mb-4">
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
                    <Link
                      href="/tokens"
                      className="brutal-btn bg-void text-neon font-[family-name:var(--font-heading)] font-bold text-sm uppercase tracking-wider px-8 py-3 border-3 border-neon hover:bg-neon/10 transition-colors inline-block"
                    >
                      View All Tokens
                    </Link>
                  </div>
                </div>
              </FadeInSection>
            </div>

            <div
              className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none"
              style={{
                backgroundImage: "linear-gradient(#00FFA3 1px, transparent 1px), linear-gradient(90deg, #00FFA3 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </section>
        </ParallaxSection>

        {/* Stats Bar */}
        <TokenStats
          totalTokens={allTokens.length}
          graduatedCount={graduatedCount}
          graduatingCount={graduatingCount}
        />

        {/* Featured Tokens Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-12" id="tokens">
          <FadeInSection>
            <section className="mb-8">
              <KingOfTheHill token={kingToken} />
            </section>
          </FadeInSection>

          {/* Filter Bar */}
          <FadeInSection delay={0.1}>
            <section className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-text">
                  {activeFilter} Tokens
                </h2>
                <p className="text-text-dim text-xs font-mono mt-1">
                  Showing {filteredTokens.length} tokens
                </p>
              </div>
              <div className="flex gap-2">
                {filters.map((filter) => (
                  <FilterButton
                    key={filter}
                    filter={filter}
                    isActive={activeFilter === filter}
                    onClick={() => setActiveFilter(filter)}
                  />
                ))}
              </div>
            </section>
          </FadeInSection>

          {/* Token Grid */}
          <StaggerContainer staggerDelay={0.1}>
            <TokenGrid tokens={filteredTokens} />
          </StaggerContainer>

          {/* View All Link */}
          <FadeInSection delay={0.3}>
            <div className="mt-8 text-center">
              <Link
                href="/tokens"
                className="inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-sm text-neon hover:text-text transition-colors border-b-2 border-neon hover:border-text pb-1"
              >
                View All {allTokens.length} Tokens
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </FadeInSection>
        </section>

        {/* Info Sections */}
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <CTASection />
      </div>
    </SmoothScroll>
  );
}
