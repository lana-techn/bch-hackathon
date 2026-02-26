'use client';

/**
 * Client-side fallback for token pages.
 * Renders when a token is not found in the static mock data,
 * attempting to load it from localStorage (launched tokens).
 */

import { useEffect, useState, memo, Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getLaunchedTokenById } from '@/lib/launched-tokens';
import { formatBCH, formatNumber, formatPercent, shortenAddress } from '@/lib/format';
import { TradePanel } from '@/components/trading/TradePanel';
import type { Token } from '@/types';

const Web3CommentStream = dynamic(
    () => import('@/components/web3').then(mod => ({ default: mod.Web3CommentStream })),
    { loading: () => <div className="h-80 bg-card border-3 border-border animate-pulse" /> }
);

const StatItem = memo(function StatItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="p-4 border-r-2 border-border last:border-r-0">
            <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim mb-1">{label}</p>
            <p className="font-[family-name:var(--font-mono)] text-xl font-bold text-text tabular-nums">{value}</p>
        </div>
    );
});

export default function TokenPageClient({ tokenId }: { tokenId: string }) {
    const [token, setToken] = useState<Token | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const found = getLaunchedTokenById(tokenId);
        setToken(found || null);
        setLoading(false);
    }, [tokenId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-void flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-neon border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-void flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-text uppercase">
                        Token <span className="text-panic">Not Found</span>
                    </h1>
                    <p className="font-[family-name:var(--font-mono)] text-sm text-text-dim max-w-md">
                        This token could not be found. It may not have been launched yet, or it was launched on a different device.
                    </p>
                    <Link
                        href="/"
                        className="inline-block font-[family-name:var(--font-mono)] text-sm text-neon hover:text-text transition-colors border-b border-neon hover:border-text"
                    >
                        ← Back to home
                    </Link>
                </div>
            </div>
        );
    }

    const graduationProgress = token.graduationTarget > 0
        ? (token.marketCapBCH / token.graduationTarget) * 100
        : 0;
    const isPositive = token.change24h >= 0;
    const supplyPercentage = token.totalSupply > 0
        ? (token.currentSupply / token.totalSupply) * 100
        : 0;

    return (
        <div className="min-h-screen bg-void">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6">
                <Link
                    href="/"
                    className="font-[family-name:var(--font-mono)] text-sm text-text-dim hover:text-neon transition-colors mb-4 inline-block"
                >
                    &larr; Back to tokens
                </Link>

                {/* Token Header */}
                <div className="bg-card border-3 border-border mb-6">
                    <div className="p-4 md:p-6 border-b-2 border-border">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-border border-3 border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {token.image ? (
                                        <img src={token.image} alt={token.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-[family-name:var(--font-heading)] text-neon text-2xl font-bold">
                                            {token.ticker.slice(0, 2)}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h1 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl font-bold uppercase text-text">
                                            {token.name}
                                        </h1>
                                        <span className="font-[family-name:var(--font-mono)] text-lg text-text-dim">
                                            ${token.ticker}
                                        </span>
                                        <span className="bg-neon/20 text-neon font-[family-name:var(--font-heading)] text-xs font-bold uppercase px-2 py-1">
                                            NEW
                                        </span>
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

                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <p className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim">Current Price</p>
                                    <p className="font-[family-name:var(--font-mono)] text-2xl font-bold text-text tabular-nums">
                                        {token.priceBCH.toExponential(4)} BCH
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-b-2 border-border">
                        <StatItem label="Market Cap" value={formatBCH(token.marketCapBCH, 2)} />
                        <StatItem label="24h Volume" value={formatBCH(token.volume24hBCH, 2)} />
                        <StatItem label="Holders" value={formatNumber(token.holders)} />
                        <StatItem label="Supply Sold" value={`${supplyPercentage.toFixed(1)}%`} />
                        <StatItem label="Transactions" value={formatNumber(token.txCount)} />
                        <StatItem label="Graduation" value={`${graduationProgress.toFixed(1)}%`} />
                    </div>

                    <div className="p-4 md:p-6 space-y-4">
                        <div>
                            <div className="w-full h-4 bg-void border-2 border-border">
                                <div
                                    className="h-full progress-bar transition-all duration-500"
                                    style={{ width: `${Math.min(graduationProgress, 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-xs">
                                <span className="font-[family-name:var(--font-heading)] text-text-dim uppercase">Bonding Curve Progress</span>
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

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Placeholder for charts - new token has no history yet */}
                        <div className="bg-card border-3 border-border p-8 text-center">
                            <p className="font-[family-name:var(--font-heading)] text-sm uppercase text-text-dim mb-2">Price Chart</p>
                            <p className="font-[family-name:var(--font-mono)] text-xs text-text-dim">
                                Chart data will appear after the first trades.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="lg:sticky lg:top-20">
                            <TradePanel
                                tokenTicker={token.ticker}
                                tokenId={token.id}
                                currentSupplySold={token.currentSupply}
                            />
                        </div>

                        <Suspense fallback={<div className="h-80 bg-card border-3 border-border animate-pulse" />}>
                            <Web3CommentStream tokenId={token.id} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
}
