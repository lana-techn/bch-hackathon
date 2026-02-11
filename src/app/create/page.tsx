'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAIImage, generateTokenNameSuggestions, generateTokenDescription } from '@/hooks/useAI';
import { getAvailableAIServices, getModelInfo } from '@/lib/ai/image-generation';
import { useTokenDeployment } from '@/hooks/useTokenDeployment';
import { DeploymentProgress } from '@/components/deployment/DeploymentProgress';
import { useWallet } from '@/components/wallet';

export default function CreateToken() {
  const router = useRouter();
  const { wallet, isConnected } = useWallet();
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [theme, setTheme] = useState('');
  const [showDeploymentProgress, setShowDeploymentProgress] = useState(false);
  
  const {
    generate: generateImage,
    isGenerating: isGeneratingImage,
    progress: imageProgress,
    error: imageError,
    result: imageResult,
  } = useAIImage();

  const [isGeneratingNames, setIsGeneratingNames] = useState(false);
  const [namesResult, setNamesResult] = useState<{ success: boolean; text?: string; error?: string } | null>(null);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [descResult, setDescResult] = useState<{ success: boolean; text?: string; error?: string } | null>(null);

  const {
    status: deploymentStatus,
    deploy: deployToken,
    reset: resetDeployment,
  } = useTokenDeployment();

  const isValid = name.trim().length > 0 && ticker.trim().length > 0 && isConnected;
  const modelInfo = getModelInfo();

  const handleGenerateImage = async () => {
    if (!name || !ticker) {
      alert('Please enter token name and ticker first');
      return;
    }

    const result = await generateImage(name, ticker, description);
    
    if (result.success && result.imageUrl) {
      setGeneratedImageUrl(result.imageUrl);
      setImagePreview(result.imageUrl);
    }
  };

  const handleUseGeneratedImage = () => {
    if (generatedImageUrl) {
      setImagePreview(generatedImageUrl);
      setShowAIGenerator(false);
    }
  };

  const handleGenerateNames = async () => {
    setIsGeneratingNames(true);
    try {
      const result = await generateTokenNameSuggestions(theme || undefined, 5);
      setNamesResult(result);
    } finally {
      setIsGeneratingNames(false);
    }
  };

  const handleSelectName = (nameStr: string, tickerStr: string) => {
    setName(nameStr);
    setTicker(tickerStr);
    setShowNameSuggestions(false);
  };

  const handleGenerateDescription = async () => {
    if (!name || !ticker) {
      alert('Please enter token name and ticker first');
      return;
    }
    setIsGeneratingDesc(true);
    try {
      const result = await generateTokenDescription(name, ticker, theme || undefined);
      setDescResult(result);
      if (result.success && result.text) {
        setDescription(result.text.substring(0, 280));
      }
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  // Parse name suggestions from AI response
  const parseNameSuggestions = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      // Match patterns like "Name (TICKER) - description" or "1. Name (TICKER): description"
      const match = line.match(/(?:\d+\.\s*)?([^()]+)\s*\(([A-Z0-9]+)\)\s*(?:-\s*:)?\s*(.*)/);
      if (match) {
        return {
          name: match[1].trim(),
          ticker: match[2].trim(),
          description: match[3]?.trim() || '',
        };
      }
      return null;
    }).filter(Boolean);
  };

  const handleLaunch = async () => {
    if (!isValid) return;
    
    setShowDeploymentProgress(true);
    
    const result = await deployToken({
      name,
      ticker,
      description,
      imageUrl: imagePreview || undefined,
      totalSupply: 1000000000,
      creatorAddress: wallet?.cashAddress || '',
    });

    if (result.success && result.tokenId) {
      // Redirect to token page after 2 seconds
      setTimeout(() => {
        router.push(`/token/${result.tokenId}`);
      }, 2000);
    }
  };

  const handleCloseDeployment = () => {
    setShowDeploymentProgress(false);
    if (deploymentStatus.step === 'complete') {
      router.push('/');
    } else if (deploymentStatus.step === 'error') {
      resetDeployment();
    }
  };

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
          
          {/* AI Badge */}
          <div className="mt-4 inline-flex items-center gap-2 bg-neon/10 border border-neon px-3 py-1">
            <span className="text-xs font-mono text-neon">🤖 AI-Powered</span>
            <span className="text-[10px] font-mono text-text-dim">FREE</span>
          </div>
        </div>

        {/* AI Name Suggestions Modal */}
        {showNameSuggestions && (
          <div className="fixed inset-0 z-50 bg-void/90 flex items-center justify-center p-4">
            <div className="bg-card border-3 border-border brutal-shadow max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-text">
                  🤖 AI <span className="text-neon">Name Suggestions</span>
                </h3>
                <button
                  onClick={() => setShowNameSuggestions(false)}
                  className="text-text-dim hover:text-panic-red transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <label className="text-xs font-mono text-text-dim block mb-2">
                  Theme (optional):
                </label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g. cat, space, robot, food..."
                  className="w-full bg-void border-2 border-border focus:border-neon outline-none px-3 py-2 text-sm text-text"
                />
              </div>

              <button
                onClick={handleGenerateNames}
                disabled={isGeneratingNames}
                className="w-full brutal-btn bg-warn text-void font-bold py-2 border-2 border-warn hover:bg-warn/90 mb-4 disabled:opacity-50"
              >
                {isGeneratingNames ? 'Generating...' : 'Generate Names (FREE)'}
              </button>

              {namesResult?.success && namesResult.text && (
                <div className="space-y-2">
                  <p className="text-xs font-mono text-text-dim mb-2">Click to select:</p>
                  {parseNameSuggestions(namesResult.text).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectName(suggestion!.name, suggestion!.ticker)}
                      className="w-full text-left p-3 bg-void border-2 border-border hover:border-neon transition-colors"
                    >
                      <div className="font-bold text-text">
                        {suggestion!.name} <span className="text-neon">({suggestion!.ticker})</span>
                      </div>
                      {suggestion!.description && (
                        <div className="text-xs text-text-dim mt-1">{suggestion!.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <p className="text-center text-[10px] font-mono text-text-dim mt-4">
                Powered by Aurora Alpha via OpenRouter
              </p>
            </div>
          </div>
        )}

        {/* AI Image Generator Modal */}
        {showAIGenerator && (
          <div className="fixed inset-0 z-50 bg-void/90 flex items-center justify-center p-4">
            <div className="bg-card border-3 border-border brutal-shadow max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase text-text">
                  🤖 AI <span className="text-neon">Image Generator</span>
                </h3>
                <button
                  onClick={() => setShowAIGenerator(false)}
                  className="text-text-dim hover:text-panic-red transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {(() => {
                const services = getAvailableAIServices();
                if (!services.dalle && !services.flux) {
                  return (
                    <div className="bg-panic-red/10 border border-panic-red p-3 mb-4">
                      <p className="text-panic-red text-sm font-mono">
                        ⚠️ No AI service configured. Add NEXT_PUBLIC_OPENAI_API_KEY or NEXT_PUBLIC_OPENROUTER_API_KEY to .env.local
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
              
              {imageError && imageError.includes('Insufficient credits') && (
                <div className="bg-warn/10 border border-warn p-3 mb-4">
                  <p className="text-warn text-sm font-mono mb-2">
                    ⚠️ Insufficient OpenRouter Credits
                  </p>
                  <p className="text-text-dim text-xs font-mono">
                    You need to add credits to your OpenRouter account.
                  </p>
                  <a 
                    href="https://openrouter.ai/settings/credits" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-neon text-xs font-mono hover:underline mt-2 inline-block"
                  >
                    Add Credits →
                  </a>
                </div>
              )}

              <p className="text-text-dim text-sm mb-4">
                Generate a professional token logo using <span className="text-neon font-bold">{modelInfo.image.name}</span> (FREE)
              </p>

              <div className="space-y-2 mb-4 text-xs font-mono">
                <div className="text-text-dim">
                  <span className="text-neon">Name:</span> {name || 'Not set'}
                </div>
                <div className="text-text-dim">
                  <span className="text-neon">Ticker:</span> {ticker || 'Not set'}
                </div>
                <div className="text-text-dim">
                  <span className="text-neon">Description:</span> {description || 'None'}
                </div>
              </div>

              {generatedImageUrl && (
                <div className="mb-4">
                  <p className="text-xs font-mono text-text-dim mb-2">Generated Image:</p>
                  <div className="w-full aspect-square bg-void border-2 border-border mb-3 overflow-hidden">
                    <img
                      src={generatedImageUrl}
                      alt="AI Generated"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={handleUseGeneratedImage}
                    className="w-full brutal-btn bg-neon text-void font-bold py-2 border-2 border-neon hover:bg-neon/90"
                  >
                    Use This Image
                  </button>
                </div>
              )}

              {isGeneratingImage && (
                <div className="mb-4">
                  <div className="w-full h-2 bg-void border border-border mb-2">
                    <div
                      className="h-full bg-neon transition-all duration-300"
                      style={{ width: `${imageProgress}%` }}
                    />
                  </div>
                  <p className="text-center text-xs font-mono text-text-dim">
                    Generating with {modelInfo.image.name}... {imageProgress}%
                  </p>
                </div>
              )}

              {imageError && (
                <p className="text-panic-red text-sm font-mono mb-3">
                  Error: {imageError}
                </p>
              )}

              <button
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || !name || !ticker}
                className={`w-full brutal-btn font-bold py-3 border-2 transition-colors ${
                  isGeneratingImage || !name || !ticker
                    ? 'bg-border text-text-dim border-border cursor-not-allowed'
                    : 'bg-warn text-void border-warn hover:bg-warn/90'
                }`}
              >
                {isGeneratingImage ? 'Generating...' : `Generate with ${modelInfo.image.name} (FREE)`}
              </button>

              <p className="text-center text-[10px] font-mono text-text-dim mt-3">
                Powered by {modelInfo.image.name} via OpenRouter
              </p>
            </div>
          </div>
        )}

      {/* Deployment Progress Modal */}
      {showDeploymentProgress && (
        <DeploymentProgress 
          status={deploymentStatus} 
          onClose={handleCloseDeployment}
        />
      )}

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
                <button
                  onClick={() => setShowAIGenerator(true)}
                  className="block font-[family-name:var(--font-mono)] text-xs text-warn hover:text-neon transition-colors underline underline-offset-2"
                >
                  ✨ Generate with AI ({modelInfo.image.name})
                </button>
                <p className="font-[family-name:var(--font-mono)] text-[10px] text-text-dim/50">
                  Requires OpenRouter credits (~$0.04)
                </p>
                <p className="font-[family-name:var(--font-mono)] text-[10px] text-text-dim">
                  PNG, JPG, GIF, or SVG. Max 1MB. Square ratio recommended.
                </p>
              </div>
            </div>
          </div>

          {/* Token Name */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-[family-name:var(--font-heading)] text-sm uppercase text-text-dim">
                Token Name *
              </label>
              <button
                onClick={() => setShowNameSuggestions(true)}
                className="text-xs font-mono text-warn hover:text-neon transition-colors underline"
              >
                🤖 AI Suggestions
              </button>
            </div>
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
            <div className="flex items-center justify-between mb-2">
              <label className="font-[family-name:var(--font-heading)] text-sm uppercase text-text-dim">
                Description
              </label>
              {name && ticker && (
                <button
                  onClick={handleGenerateDescription}
                  disabled={isGeneratingDesc}
                  className="text-xs font-mono text-warn hover:text-neon transition-colors underline disabled:opacity-50"
                >
                  {isGeneratingDesc ? 'Generating...' : '🤖 Auto-Generate'}
                </button>
              )}
            </div>
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
              {descResult?.success && <span className="text-neon ml-2">✓ AI Generated</span>}
            </p>
          </div>

          {/* Smart Contract Details */}
          <div className="border-t-2 border-border pt-6">
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
                the bonding curve math or graduation to DEX.
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
                  Graduation Target
                </p>
                <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-warn tabular-nums">
                  40 BCH
                </p>
              </div>
            </div>
          </div>

          {/* Wallet Connection Warning */}
          {!isConnected && (
            <div className="bg-warn/10 border border-warn p-3">
              <p className="text-warn text-sm font-mono text-center">
                ⚠️ Please connect your wallet to launch token
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleLaunch}
            disabled={!isValid || deploymentStatus.step !== 'idle'}
            className={`w-full py-4 font-[family-name:var(--font-heading)] text-base font-bold uppercase tracking-wider brutal-btn border-3 transition-all ${
              isValid && deploymentStatus.step === 'idle'
                ? 'bg-neon text-void border-neon hover:bg-neon/90 cursor-pointer'
                : 'bg-border text-text-dim border-border cursor-not-allowed'
            }`}
          >
            {!isConnected 
              ? 'Connect Wallet to Launch'
              : !isValid
              ? 'Fill Required Fields'
              : deploymentStatus.step !== 'idle'
              ? 'Launching...'
              : `Launch $${ticker || 'TOKEN'} Now`
            }
          </button>
        </div>
      </div>
    </div>
  );
}
