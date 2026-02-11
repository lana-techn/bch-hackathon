'use client';

import { useState, useCallback } from 'react';
import { generateTokenImage, ImageGenerateResult } from '@/lib/ai/image-generation';
import { generateTokenNameSuggestions, generateTokenDescription } from '@/lib/ai/openrouter';

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
      const generateResult = await generateTokenImage(name, ticker, description);
      
      setProgress(100);
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

// Re-export text generation functions
export { generateTokenNameSuggestions, generateTokenDescription };
