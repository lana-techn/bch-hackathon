'use client';

import { Token } from "@/types";
import { formatBCH, formatNumber, formatPercent, shortenAddress } from "@/lib/format";

interface TokenPerformanceStatsProps {
  token: Token;
}

export function TokenPerformanceStats({ token }: TokenPerformanceStatsProps) {
  const graduationProgress = (token.marketCapBCH / token.graduationTarget) * 100;
  const isPositive24h = token.change24h >= 0;
  const isPositive7d = (token.change7d || 0) >= 0;
  const isPositive30d = (token.change30d || 0) >= 0;
  const supplyPercentage = (token.currentSupply / token.totalSupply) * 100;

  // Calculate ATH/ATL distance
  const athDistance = token.athBCH 
    ? ((token.priceBCH - token.athBCH) / token.athBCH) * 100 
    : 0;
  const atlDistance = token.atlBCH 
    ? ((token.priceBCH - token.atlBCH) / token.atlBCH) * 100 
    : 0;

  return (
    <div className="bg-card border-3 border-border">
      {/* Header */}
      <div className="p-4 border-b-2 border-border">
        <h2 className="font-[family-name:var(--font-heading)] text-lg uppercase tracking-wider text-text">
          Performance Metrics
        </h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Price Performance Section */}
        <div>
          <h3 className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim mb-3 tracking-wider">
            Price Performance
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-void p-3 border border-border">
              <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                24h Change
              </p>
              <p className={`font-[family-name:var(--font-mono)] text-lg font-bold tabular-nums ${
                isPositive24h ? "text-neon" : "text-panic"
              }`}>
                {formatPercent(token.change24h)}
              </p>
            </div>
            <div className="bg-void p-3 border border-border">
              <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                7d Change
              </p>
              <p className={`font-[family-name:var(--font-mono)] text-lg font-bold tabular-nums ${
                isPositive7d ? "text-neon" : "text-panic"
              }`}>
                {token.change7d ? formatPercent(token.change7d) : "N/A"}
              </p>
            </div>
            <div className="bg-void p-3 border border-border">
              <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                30d Change
              </p>
              <p className={`font-[family-name:var(--font-mono)] text-lg font-bold tabular-nums ${
                isPositive30d ? "text-neon" : "text-panic"
              }`}>
                {token.change30d ? formatPercent(token.change30d) : "N/A"}
              </p>
            </div>
            <div className="bg-void p-3 border border-border">
              <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                ATH Distance
              </p>
              <p className={`font-[family-name:var(--font-mono)] text-lg font-bold tabular-nums ${
                athDistance >= 0 ? "text-neon" : "text-panic"
              }`}>
                {token.athBCH ? formatPercent(athDistance) : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* ATH/ATL Section */}
        {token.athBCH && (
          <div>
            <h3 className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim mb-3 tracking-wider">
              All Time High/Low
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-neon/5 border border-neon/20">
                <div>
                  <span className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-neon">
                    All Time High
                  </span>
                  <p className="font-[family-name:var(--font-mono)] text-xs text-text-dim">
                    {token.athDate}
                  </p>
                </div>
                <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-neon">
                  {token.athBCH.toExponential(4)} BCH
                </p>
              </div>
              {token.atlBCH && (
                <div className="flex justify-between items-center p-2 bg-panic/5 border border-panic/20">
                  <div>
                    <span className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-panic">
                      All Time Low
                    </span>
                    <p className="font-[family-name:var(--font-mono)] text-xs text-text-dim">
                      {token.atlDate}
                    </p>
                  </div>
                  <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-panic">
                    {token.atlBCH.toExponential(4)} BCH
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Volume Section */}
        <div>
          <h3 className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim mb-3 tracking-wider">
            Volume Analysis
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-void border border-border">
              <span className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                24h Volume
              </span>
              <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-text">
                {formatBCH(token.volume24hBCH, 2)}
              </p>
            </div>
            {token.volume7dBCH && (
              <div className="flex justify-between items-center p-2 bg-void border border-border">
                <span className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                  7d Volume
                </span>
                <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-text">
                  {formatBCH(token.volume7dBCH, 2)}
                </p>
              </div>
            )}
            {token.volume30dBCH && (
              <div className="flex justify-between items-center p-2 bg-void border border-border">
                <span className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                  30d Volume
                </span>
                <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-text">
                  {formatBCH(token.volume30dBCH, 2)}
                </p>
              </div>
            )}
            {token.volume7dBCH && (
              <div className="flex justify-between items-center p-2 bg-void border border-border">
                <span className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                  Avg Daily Vol (7d)
                </span>
                <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-text">
                  {formatBCH(token.volume7dBCH / 7, 2)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Supply Distribution */}
        <div>
          <h3 className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim mb-3 tracking-wider">
            Supply Distribution
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-[family-name:var(--font-heading)] text-text-dim">
                  Sold via Bonding Curve
                </span>
                <span className="font-[family-name:var(--font-mono)] text-neon">
                  {supplyPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-void border border-border">
                <div
                  className="h-full bg-neon transition-all duration-500"
                  style={{ width: `${supplyPercentage}%` }}
                />
              </div>
              <p className="font-[family-name:var(--font-mono)] text-xs text-text-dim mt-1">
                {formatNumber(token.currentSupply)} / {formatNumber(token.totalSupply)} tokens
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-[family-name:var(--font-heading)] text-text-dim">
                  Graduation Progress
                </span>
                <span className="font-[family-name:var(--font-mono)] text-warn">
                  {graduationProgress.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-void border border-border">
                <div
                  className="h-full progress-bar transition-all duration-500"
                  style={{ width: `${Math.min(graduationProgress, 100)}%` }}
                />
              </div>
              <p className="font-[family-name:var(--font-mono)] text-xs text-text-dim mt-1">
                {formatBCH(token.marketCapBCH, 2)} / {formatBCH(token.graduationTarget, 0)} BCH
              </p>
            </div>
          </div>
        </div>

        {/* Holder Stats */}
        <div>
          <h3 className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim mb-3 tracking-wider">
            Holder Statistics
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-void p-3 border border-border">
              <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                Total Holders
              </p>
              <p className="font-[family-name:var(--font-mono)] text-xl font-bold text-text">
                {formatNumber(token.holders)}
              </p>
            </div>
            <div className="bg-void p-3 border border-border">
              <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                Avg Holdings
              </p>
              <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-text">
                {formatNumber(Math.floor(token.currentSupply / token.holders))} tokens
              </p>
            </div>
          </div>
          
          {token.topHolders && token.topHolders.length > 0 && (
            <div className="mt-3">
              <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim mb-2">
                Top Holders Distribution
              </p>
              <div className="space-y-1">
                {token.topHolders.slice(0, 5).map((holder, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-void border border-border text-xs">
                    <span className="font-[family-name:var(--font-mono)] text-text-dim">
                      #{index + 1} {shortenAddress(holder.address)}
                    </span>
                    <span className="font-[family-name:var(--font-mono)] text-neon">
                      {holder.percentage.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Token Info */}
        <div>
          <h3 className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim mb-3 tracking-wider">
            Token Information
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 bg-void border border-border">
              <span className="font-[family-name:var(--font-heading)] text-text-dim uppercase">
                Creator
              </span>
              <span className="font-[family-name:var(--font-mono)] text-neon">
                {shortenAddress(token.creatorAddress)}
              </span>
            </div>
            <div className="flex justify-between p-2 bg-void border border-border">
              <span className="font-[family-name:var(--font-heading)] text-text-dim uppercase">
                Total Supply
              </span>
              <span className="font-[family-name:var(--font-mono)] text-text">
                {formatNumber(token.totalSupply)}
              </span>
            </div>
            <div className="flex justify-between p-2 bg-void border border-border">
              <span className="font-[family-name:var(--font-heading)] text-text-dim uppercase">
                Transactions
              </span>
              <span className="font-[family-name:var(--font-mono)] text-text">
                {formatNumber(token.txCount)}
              </span>
            </div>
            {token.category && (
              <div className="flex justify-between p-2 bg-void border border-border">
                <span className="font-[family-name:var(--font-heading)] text-text-dim uppercase">
                  Category
                </span>
                <span className="font-[family-name:var(--font-mono)] uppercase text-text">
                  {token.category}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Social Links */}
        {token.socials && (
          <div>
            <h3 className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim mb-3 tracking-wider">
              Links
            </h3>
            <div className="flex flex-wrap gap-2">
              {token.socials.website && (
                <a
                  href={token.socials.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-void border border-border hover:border-neon hover:text-neon transition-colors font-[family-name:var(--font-mono)] text-xs"
                >
                  Website
                </a>
              )}
              {token.socials.twitter && (
                <a
                  href={token.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-void border border-border hover:border-neon hover:text-neon transition-colors font-[family-name:var(--font-mono)] text-xs"
                >
                  Twitter
                </a>
              )}
              {token.socials.telegram && (
                <a
                  href={token.socials.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-void border border-border hover:border-neon hover:text-neon transition-colors font-[family-name:var(--font-mono)] text-xs"
                >
                  Telegram
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
