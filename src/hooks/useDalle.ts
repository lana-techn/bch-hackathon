/**
 * React Hook for DALL-E AI Image Generation
 */

'use client';

import { useState, useCallback } from 'react';
import { generateTokenImage, generateTokenImageVariations, DalleGenerateResult } from '@/lib/ai/dalle';

interface UseDalleReturn {
  generate: (name: string, ticker: string, description: string) => Promise<DalleGenerateResult>;
  generateVariations: (name: string, ticker: string, description: string, count?: number) => Promise<DalleGenerateResult[]>;
  isGenerating: boolean;
  progress: number;
  error: string | null;
  result: DalleGenerateResult | null;
  variations: DalleGenerateResult[];
}

export function useDalle(): UseDalleReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DalleGenerateResult | null>(null);
  const [variations, setVariations] = useState<DalleGenerateResult[]>([]);

  const generate = useCallback(async (
    name: string,
    ticker: string,
    description: string
  ): Promise<DalleGenerateResult> => {
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

  const generateVariations = useCallback(async (
    name: string,
    ticker: string,
    description: string,
    count: number = 3
  ): Promise<DalleGenerateResult[]> => {
    setIsGenerating(true);
    setProgress(10);
    setError(null);
    setVariations([]);

    try {
      setProgress(30);
      const results = await generateTokenImageVariations(name, ticker, description, count);
      
      setProgress(100);
      setVariations(results);

      const failedCount = results.filter(r => !r.success).length;
      if (failedCount > 0) {
        setError(`${failedCount} of ${count} generations failed`);
      }

      return results;
    } catch (err: any) {
      setError(err.message || 'Generation failed');
      return [];
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generate,
    generateVariations,
    isGenerating,
    progress,
    error,
    result,
    variations,
  };
}
