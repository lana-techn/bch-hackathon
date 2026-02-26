'use client';

import { useState, useMemo, memo } from "react";
import Link from "next/link";
import { mockTokens } from "@/data/mock-tokens";
import { TokenCard } from "@/components/ui/TokenCard";
import { SmoothScroll } from "@/components/providers";
import { FadeInSection, StaggerContainer, StaggerItem } from "@/components/animations";

const FILTERS = ["All", "Trending", "New", "Graduating", "Graduated"] as const;
type FilterType = typeof FILTERS[number];

const SORT_OPTIONS = [
  { value: "marketCap", label: "Market Cap" },
  { value: "volume", label: "Volume (24h)" },
  { value: "change", label: "Price Change" },
  { value: "newest", label: "Newest" },
] as const;

const TokenGrid = memo(function TokenGrid({ tokens }: { tokens: typeof mockTokens }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tokens.map((token) => (
        <StaggerItem key={token.id}>
          <TokenCard token={token} />
        </StaggerItem>
      ))}
    </div>
  );
});

export default function TokensPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [sortBy, setSortBy] = useState<string>("marketCap");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTokens = useMemo(() => {
    let tokens = [...mockTokens];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tokens = tokens.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.ticker.toLowerCase().includes(query)
      );
    }

    // Apply filter
    switch (activeFilter) {
      case "Graduated":
        tokens = tokens.filter((t) => t.isGraduated);
        break;
      case "Graduating":
        tokens = tokens.filter(
          (t) => !t.isGraduated && t.marketCapBCH / t.graduationTarget > 0.75
        );
        break;
      case "New":
        tokens = tokens.filter(
          (t) => new Date(t.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        break;
      case "Trending":
        tokens = tokens.filter((t) => t.volume24hBCH > 1);
        break;
      default:
        break;
    }

    // Apply sort
    switch (sortBy) {
      case "marketCap":
        tokens.sort((a, b) => b.marketCapBCH - a.marketCapBCH);
        break;
      case "volume":
        tokens.sort((a, b) => b.volume24hBCH - a.volume24hBCH);
        break;
      case "change":
        tokens.sort((a, b) => b.change24h - a.change24h);
        break;
      case "newest":
        tokens.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return tokens;
  }, [activeFilter, sortBy, searchQuery]);

  const stats = useMemo(() => {
    const totalVolume = filteredTokens.reduce((sum, t) => sum + t.volume24hBCH, 0);
    const graduatedCount = filteredTokens.filter((t) => t.isGraduated).length;
    return { totalVolume, graduatedCount, count: filteredTokens.length };
  }, [filteredTokens]);

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-void">
        {/* Header */}
        <section className="border-b-3 border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <FadeInSection>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <Link
                    href="/"
                    className="font-[family-name:var(--font-mono)] text-sm text-text-dim hover:text-neon transition-colors mb-2 inline-block"
                  >
                    &larr; Back to Home
                  </Link>
                  <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold uppercase text-text">
                    All <span className="text-neon">Tokens</span>
                  </h1>
                  <p className="text-text-dim mt-2">
                    Browse all {mockTokens.length} tokens on IITEBCH
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="text-text-dim font-mono text-xs">Showing</p>
                    <p className="font-bold text-neon font-mono">{stats.count}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-dim font-mono text-xs">24h Volume</p>
                    <p className="font-bold text-text font-mono">
                      {stats.totalVolume.toFixed(2)} BCH
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-dim font-mono text-xs">Graduated</p>
                    <p className="font-bold text-warn font-mono">
                      {stats.graduatedCount}
                    </p>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* Filters & Search */}
        <section className="border-b-3 border-border sticky top-16 bg-void/95 backdrop-blur-sm z-30">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
            <FadeInSection delay={0.1}>
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                {/* Filter Tabs */}
                <div className="flex gap-2 flex-wrap">
                  {FILTERS.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-4 py-2 font-[family-name:var(--font-heading)] text-xs uppercase tracking-wider border-2 transition-all ${activeFilter === filter
                          ? "border-neon text-neon bg-neon/10"
                          : "border-border text-text-dim hover:border-text hover:text-text"
                        }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Search & Sort */}
                <div className="flex gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search tokens..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-card border-2 border-border px-4 py-2 pl-10 font-mono text-sm text-text placeholder:text-text-dim/50 focus:border-neon outline-none w-48 md:w-64"
                    />
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-card border-2 border-border px-4 py-2 font-mono text-sm text-text focus:border-neon outline-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        Sort by: {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* Token Grid */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          {filteredTokens.length > 0 ? (
            <StaggerContainer staggerDelay={0.05}>
              <TokenGrid tokens={filteredTokens} />
            </StaggerContainer>
          ) : (
            <div className="text-center py-20">
              <p className="text-text-dim font-mono text-lg">
                No tokens found matching your criteria
              </p>
              <button
                onClick={() => {
                  setActiveFilter("All");
                  setSearchQuery("");
                }}
                className="mt-4 text-neon hover:underline font-mono text-sm"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>
    </SmoothScroll>
  );
}
