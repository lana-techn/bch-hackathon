import { mockTokens } from "@/data/mock-tokens";
import { TokenCard } from "@/components/ui/TokenCard";
import { KingOfTheHill } from "@/components/ui/KingOfTheHill";
import Link from "next/link";

export default function Home() {
  // Sort tokens: highest market cap first for King
  const sortedTokens = [...mockTokens].sort(
    (a, b) => b.marketCapBCH - a.marketCapBCH
  );
  const kingToken = sortedTokens[0];
  const otherTokens = sortedTokens.slice(1);

  // Stats
  const totalVolume = mockTokens.reduce((sum, t) => sum + t.volume24hBCH, 0);
  const totalTokens = mockTokens.length;
  const graduatedCount = mockTokens.filter((t) => t.isGraduated).length;

  return (
    <div className="min-h-screen bg-void">
      {/* Hero Section */}
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

        {/* Decorative grid */}
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
          <div className="w-full h-full" style={{
            backgroundImage: "linear-gradient(#00FFA3 1px, transparent 1px), linear-gradient(90deg, #00FFA3 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
        </div>
      </section>

      {/* Stats Bar */}
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

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8" id="tokens">
        {/* King of the Hill */}
        <section className="mb-8">
          <KingOfTheHill token={kingToken} />
        </section>

        {/* Filter Bar */}
        <section className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-text">
            All Tokens
          </h2>
          <div className="flex gap-2">
            {["Trending", "New", "Graduating", "Graduated"].map((filter) => (
              <button
                key={filter}
                className={`px-3 py-1 font-[family-name:var(--font-heading)] text-xs uppercase tracking-wider border-2 transition-colors ${
                  filter === "Trending"
                    ? "border-neon text-neon bg-neon/10"
                    : "border-border text-text-dim hover:border-text hover:text-text"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* Token Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherTokens.map((token) => (
            <TokenCard key={token.id} token={token} />
          ))}
        </section>
      </div>
    </div>
  );
}
