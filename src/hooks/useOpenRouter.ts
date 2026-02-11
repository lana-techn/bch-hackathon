'use client';

import { useState, useCallback } from 'react';
import { 
  generateTokenImageWithFlux, 
  generateTokenNameSuggestions, 
  generateTokenDescription,
  ImageGenerateResult,
  TextGenerateResult 
} from '@/lib/ai/openrouter';

interface UseOpenRouterReturn {
  // Image generation
  generateImage: (name: string, ticker: string, description: string) => Promise<ImageGenerateResult>;
  isGeneratingImage: boolean;
  imageProgress: number;
  imageError: string | null;
  imageResult: ImageGenerateResult | null;
  
  // Name suggestions
  generateNames: (theme?: string, count?: number) => Promise<TextGenerateResult>;
  isGeneratingNames: boolean;
  namesError: string | null;
  namesResult: TextGenerateResult | null;
  
  // Description generation
  generateDesc: (name: string, ticker: string, theme?: string) => Promise<TextGenerateResult>;
  isGeneratingDesc: boolean;
  descError: string | null;
  descResult: TextGenerateResult | null;
}

export function useOpenRouter(): UseOpenRouterReturn {
  // Image generation state
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageResult, setImageResult] = useState<ImageGenerateResult | null>(null);
  
  // Name suggestions state
  const [isGeneratingNames, setIsGeneratingNames] = useState(false);
  const [namesError, setNamesError] = useState<string | null>(null);
  const [namesResult, setNamesResult] = useState<TextGenerateResult | null>(null);
  
  // Description generation state
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [descError, setDescError] = useState<string | null>(null);
  const [descResult, setDescResult] = useState<TextGenerateResult | null>(null);

  // Generate image
  const generateImage = useCallback(async (
    name: string,
    ticker: string,
    description: string
  ): Promise<ImageGenerateResult> => {
    setIsGeneratingImage(true);
    setImageProgress(10);
    setImageError(null);
    setImageResult(null);

    try {
      setImageProgress(30);
      const result = await generateTokenImageWithFlux(name, ticker, description);
      
      setImageProgress(100);
      setImageResult(result);

      if (!result.success) {
        setImageError(result.error || 'Generation failed');
      }

      return result;
    } catch (err: any) {
      setImageError(err.message || 'Generation failed');
      return {
        success: false,
        error: err.message || 'Generation failed',
      };
    } finally {
      setIsGeneratingImage(false);
    }
  }, []);

  // Generate name suggestions
  const generateNames = useCallback(async (
    theme?: string,
    count: number = 5
  ): Promise<TextGenerateResult> => {
    setIsGeneratingNames(true);
    setNamesError(null);
    setNamesResult(null);

    try {
      const result = await generateTokenNameSuggestions(theme, count);
      setNamesResult(result);

      if (!result.success) {
        setNamesError(result.error || 'Failed to generate names');
      }

      return result;
    } catch (err: any) {
      setNamesError(err.message || 'Failed to generate names');
      return {
        success: false,
        error: err.message || 'Failed to generate names',
      };
    } finally {
      setIsGeneratingNames(false);
    }
  }, []);

  // Generate description
  const generateDesc = useCallback(async (
    name: string,
    ticker: string,
    theme?: string
  ): Promise<TextGenerateResult> => {
    setIsGeneratingDesc(true);
    setDescError(null);
    setDescResult(null);

    try {
      const result = await generateTokenDescription(name, ticker, theme);
      setDescResult(result);

      if (!result.success) {
        setDescError(result.error || 'Failed to generate description');
      }

      return result;
    } catch (err: any) {
      setDescError(err.message || 'Failed to generate description');
      return {
        success: false,
        error: err.message || 'Failed to generate description',
      };
    } finally {
      setIsGeneratingDesc(false);
    }
  }, []);

  return {
    generateImage,
    isGeneratingImage,
    imageProgress,
    imageError,
    imageResult,
    generateNames,
    isGeneratingNames,
    namesError,
    namesResult,
    generateDesc,
    isGeneratingDesc,
    descError,
    descResult,
  };
}
