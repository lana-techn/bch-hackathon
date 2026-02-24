"use client";

import { useEffect, useState } from "react";

interface ShareButtonProps {
    ticker: string;
    tokenId: string;
}

export function ShareButton({ ticker, tokenId }: ShareButtonProps) {
    const [url, setUrl] = useState<string>("");

    useEffect(() => {
        setUrl(window.location.origin + "/token/" + tokenId);
    }, [tokenId]);

    const shareText = `Check out $${ticker} on @bch_hacks! 🚀\n\nFair launch, no presale, bonding curve pricing.\n\n`;
    const intentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;

    return (
        <a
            href={intentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#000000] text-white font-[family-name:var(--font-heading)] uppercase tracking-wider font-bold px-3 py-1.5 border-2 border-[#000000] hover:bg-[#000000]/80 transition-colors text-xs"
            suppressHydrationWarning
        >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.004 3.936H5.021z" />
            </svg>
            Share Token
        </a>
    );
}
