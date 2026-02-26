'use client';

import { useState, useCallback } from 'react';

interface ImageGenerateResult {
  success: boolean;
  imageUrl?: string;
  modelUsed?: string;
  error?: string;
}

interface TextGenerateResult {
  success: boolean;
  text?: string;
  error?: string;
}

interface UseAIImageReturn {
  generate: (name: string, ticker: string, description: string) => Promise<ImageGenerateResult>;
  isGenerating: boolean;
  progress: number;
  error: string | null;
  result: ImageGenerateResult | null;
}

export function useAIImage(): UseAIImageReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageGenerateResult | null>(null);

  const generate = useCallback(async (
    name: string,
    ticker: string,
    description: string
  ): Promise<ImageGenerateResult> => {
    setIsGenerating(true);
    setProgress(10);
    setError(null);
    setResult(null);

    try {
      setProgress(30);

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'image', name, ticker, description }),
      });

      const data = await res.json();
      setProgress(100);

      const generateResult: ImageGenerateResult = {
        success: data.success,
        imageUrl: data.imageUrl,
        modelUsed: 'FLUX.2 Max',
        error: data.error,
      };

      setResult(generateResult);

      if (!generateResult.success) {
        setError(generateResult.error || 'Generation failed');
      }

      return generateResult;
    } catch (err: any) {
      setError(err.message || 'Generation failed');
      return {
        success: false,
        error: err.message || 'Generation failed',
      };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generate,
    isGenerating,
    progress,
    error,
    result,
  };
}

/**
 * Generate token name suggestions via server API route.
 */
export async function generateTokenNameSuggestions(
  theme?: string,
  count: number = 5
): Promise<TextGenerateResult> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'suggestions', theme, count }),
    });

    const data = await res.json();
    return {
      success: data.success,
      text: data.text,
      error: data.error,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to generate suggestions',
    };
  }
}

/**
 * Generate token description via server API route.
 */
export async function generateTokenDescription(
  name: string,
  ticker: string,
  theme?: string
): Promise<TextGenerateResult> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'description', name, ticker, theme }),
    });

    const data = await res.json();
    return {
      success: data.success,
      text: data.text,
      error: data.error,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to generate description',
    };
  }
}
