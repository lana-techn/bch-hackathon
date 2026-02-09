"use client";

import { useState } from "react";
import Link from "next/link";

export default function CreateToken() {
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const isValid = name.trim().length > 0 && ticker.trim().length > 0;

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="font-[family-name:var(--font-mono)] text-sm text-text-dim hover:text-neon transition-colors mb-4 inline-block"
          >
            &larr; Back to tokens
          </Link>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold uppercase text-text">
            Launch <span className="text-neon">Token</span>
          </h1>
          <p className="text-text-dim mt-2 max-w-md">
            Deploy a CashToken with bonding curve pricing in under 2 seconds.
            No presale. No team allocation. Fair launch guaranteed.
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border-3 border-border brutal-shadow p-6 space-y-6">
          {/* Token Image */}
          <div>
            <label className="font-[family-name:var(--font-heading)] text-sm uppercase text-text-dim block mb-2">
              Token Image
            </label>
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 bg-void border-3 border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-[family-name:var(--font-heading)] text-text-dim text-xs uppercase text-center px-2">
                    No Image
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label className="brutal-btn bg-void text-neon font-[family-name:var(--font-heading)] font-bold text-xs uppercase tracking-wider px-4 py-2 border-2 border-neon hover:bg-neon/10 transition-colors cursor-pointer inline-block">
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () =>
                          setImagePreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                <button className="block font-[family-name:var(--font-mono)] text-xs text-text-dim hover:text-warn transition-colors underline underline-offset-2">
                  Generate with AI (coming soon)
                </button>
                <p className="font-[family-name:var(--font-mono)] text-[10px] text-text-dim">
                  PNG, JPG, GIF, or SVG. Max 1MB. Square ratio recommended.
                </p>
              </div>
            </div>
          </div>

          {/* Token Name */}
          <div>
            <label className="font-[family-name:var(--font-heading)] text-sm uppercase text-text-dim block mb-2">
              Token Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. BitCat"
              maxLength={32}
              className="w-full bg-void border-2 border-border focus:border-neon outline-none px-4 py-3 font-[family-name:var(--font-body)] text-base text-text placeholder:text-text-dim/30"
            />
            <p className="font-[family-name:var(--font-mono)] text-[10px] text-text-dim mt-1">
              {name.length}/32 characters
            </p>
          </div>

          {/* Token Ticker */}
          <div>
            <label className="font-[family-name:var(--font-heading)] text-sm uppercase text-text-dim block mb-2">
              Ticker Symbol *
            </label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="e.g. BCAT"
              maxLength={8}
              className="w-full bg-void border-2 border-border focus:border-neon outline-none px-4 py-3 font-[family-name:var(--font-heading)] text-base text-text uppercase placeholder:text-text-dim/30 placeholder:normal-case"
            />
            <p className="font-[family-name:var(--font-mono)] text-[10px] text-text-dim mt-1">
              {ticker.length}/8 characters. Uppercase letters only.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="font-[family-name:var(--font-heading)] text-sm uppercase text-text-dim block mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the world about your token..."
              maxLength={280}
              rows={3}
              className="w-full bg-void border-2 border-border focus:border-neon outline-none px-4 py-3 font-[family-name:var(--font-body)] text-sm text-text placeholder:text-text-dim/30 resize-none"
            />
            <p className="font-[family-name:var(--font-mono)] text-[10px] text-text-dim mt-1">
              {description.length}/280 characters
            </p>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-border" />

          {/* Smart Contract Details */}
          <div>
            <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase text-text-dim mb-3">
              Smart Contract (CashScript Covenant)
            </h3>
            <div className="bg-void border-2 border-neon/30 p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-neon" />
                <span className="font-[family-name:var(--font-heading)] text-xs uppercase text-neon">
                  On-Chain Verified
                </span>
              </div>
              <p className="font-[family-name:var(--font-mono)] text-[10px] text-text-dim leading-relaxed">
                Your token will be deployed as a CashScript bonding curve covenant.
                Liquidity is locked by the contract and can only be released through
                the bonding curve math or graduation to DEX. No one - including the
                creator - can rug pull.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-void border-2 border-border p-3">
                <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                  Total Supply
                </p>
                <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-text tabular-nums">
                  1,000,000,000
                </p>
              </div>
              <div className="bg-void border-2 border-border p-3">
                <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                  Curve Type
                </p>
                <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-neon tabular-nums">
                  Linear (P = mS)
                </p>
              </div>
              <div className="bg-void border-2 border-border p-3">
                <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                  Curve Supply
                </p>
                <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-text tabular-nums">
                  800M (80%)
                </p>
              </div>
              <div className="bg-void border-2 border-border p-3">
                <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                  DEX Reserve
                </p>
                <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-text tabular-nums">
                  200M (20%)
                </p>
              </div>
              <div className="bg-void border-2 border-border p-3">
                <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                  Graduation Target
                </p>
                <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-warn tabular-nums">
                  40 BCH
                </p>
              </div>
              <div className="bg-void border-2 border-border p-3">
                <p className="font-[family-name:var(--font-heading)] text-[10px] uppercase text-text-dim">
                  Trading Fee
                </p>
                <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-text tabular-nums">
                  1%
                </p>
              </div>
            </div>
          </div>

          {/* Contract Deployment Steps */}
          <div className="bg-void border-2 border-border p-3">
            <h4 className="font-[family-name:var(--font-heading)] text-xs uppercase text-text-dim mb-2">
              Deployment Flow
            </h4>
            <ol className="space-y-1.5 font-[family-name:var(--font-mono)] text-[10px] text-text-dim">
              <li className="flex items-start gap-2">
                <span className="text-neon font-bold">1.</span>
                <span>Genesis TX: Create minting NFT for your token category</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon font-bold">2.</span>
                <span>Mint TX: Mint 1B fungible tokens + create mutable NFT (state)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon font-bold">3.</span>
                <span>Lock TX: Send all tokens to BondingCurve.cash covenant UTXO</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon font-bold">4.</span>
                <span>Token is LIVE - tradeable via bonding curve in &lt;2 seconds</span>
              </li>
            </ol>
          </div>

          {/* Launch Fee */}
          <div className="bg-void border-2 border-warn/30 p-3">
            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-heading)] text-xs uppercase text-warn">
                Launch Fee
              </span>
              <span className="font-[family-name:var(--font-mono)] text-sm font-bold text-warn tabular-nums">
                0.005 BCH
              </span>
            </div>
            <p className="font-[family-name:var(--font-mono)] text-[10px] text-text-dim mt-1">
              Anti-spam fee. Non-refundable.
            </p>
          </div>

          {/* Submit */}
          <button
            disabled={!isValid}
            className={`w-full py-4 font-[family-name:var(--font-heading)] text-base font-bold uppercase tracking-wider brutal-btn border-3 transition-all ${
              isValid
                ? "bg-neon text-void border-neon hover:bg-neon/90 cursor-pointer"
                : "bg-border text-text-dim border-border cursor-not-allowed"
            }`}
          >
            {isValid
              ? `Launch $${ticker || "TOKEN"} Now`
              : "Fill Required Fields"}
          </button>

          <p className="text-center font-[family-name:var(--font-mono)] text-[10px] text-text-dim">
            By launching, you agree that liquidity is locked in the bonding
            curve contract and cannot be withdrawn.
          </p>
        </div>
      </div>
    </div>
  );
}
