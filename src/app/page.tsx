'use client';

import { memo } from "react";
import Link from "next/link";
import { mockTokens } from "@/data/mock-tokens";
import { TokenCard } from "@/components/ui/TokenCard";
import { KingOfTheHill } from "@/components/ui/KingOfTheHill";
import { SmoothScroll } from "@/components/providers";
import { FeaturesSection, HowItWorksSection, StatsSection, CTASection } from "@/components/sections";
import { FadeInSection, ParallaxSection, StaggerContainer, StaggerItem } from "@/components/animations";

// Memoized components
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

const TokenStats = memo(function TokenStats() {
  // Limit to 6 tokens for homepage
  const displayTokens = mockTokens.slice(0, 6);
  const totalVolume = displayTokens.reduce((sum, t) => sum + t.volume24hBCH, 0);
  const graduatedCount = displayTokens.filter((t) => t.isGraduated).length;

  return (
    <section className="border-b-3 border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-8">
            <div>
              <p className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim">
                Featured Tokens
              </p>
              <p className="font-[family-name:var(--font-mono)] text-xl font-bold text-neon tabular-nums">
                6
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

const TokenGrid = memo(function TokenGrid({ tokens }: { tokens: typeof mockTokens }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tokens.map((token) => (
        <TokenCard key={token.id} token={token} />
      ))}
    </section>
  );
});

export default function Home() {
  // Sort tokens: highest market cap first for King
  const sortedTokens = [...mockTokens].sort(
    (a, b) => b.marketCapBCH - a.marketCapBCH
  );
  const kingToken = sortedTokens[0];
  
  // Only show top 6 tokens on homepage
  const displayTokens = sortedTokens.slice(1, 7);

  const filters = ["Trending", "New", "Graduating", "Graduated"];

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-void">
        {/* Hero Section with Parallax */}
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

            {/* Decorative grid */}
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
        <TokenStats />

        {/* Featured Tokens Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-12" id="tokens">
          <FadeInSection>
            {/* King of the Hill */}
            <section className="mb-8">
              <KingOfTheHill token={kingToken} />
            </section>
          </FadeInSection>

          {/* Filter Bar */}
          <FadeInSection delay={0.1}>
            <section className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-text">
                  Trending Tokens
                </h2>
                <p className="text-text-dim text-xs font-mono mt-1">
                  Showing 6 of {mockTokens.length} tokens
                </p>
              </div>
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
          </FadeInSection>

          {/* Token Grid */}
          <StaggerContainer staggerDelay={0.1}>
            <TokenGrid tokens={displayTokens} />
          </StaggerContainer>

          {/* View All Link */}
          <FadeInSection delay={0.3}>
            <div className="mt-8 text-center">
              <Link
                href="/tokens"
                className="inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-sm text-neon hover:text-text transition-colors border-b-2 border-neon hover:border-text pb-1"
              >
                View All {mockTokens.length} Tokens
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </FadeInSection>
        </section>

        {/* Features Section */}
        <FeaturesSection />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Stats Section */}
        <StatsSection />

        {/* CTA Section */}
        <CTASection />
      </div>
    </SmoothScroll>
  );
}
