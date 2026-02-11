/**
 * React hooks for IPFS uploads
 */

'use client';

import { useState, useCallback } from 'react';
import { uploadToIPFS, uploadJSONToIPFS, IPFSUploadResult } from '@/lib/ipfs';

interface UseIPFSUploadReturn {
  upload: (file: File, options?: { name?: string; metadata?: Record<string, string> }) => Promise<IPFSUploadResult>;
  uploadJSON: (json: object, name: string) => Promise<IPFSUploadResult>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  result: IPFSUploadResult | null;
}

export function useIPFSUpload(): UseIPFSUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IPFSUploadResult | null>(null);

  const upload = useCallback(async (
    file: File,
    options?: { name?: string; metadata?: Record<string, string> }
  ): Promise<IPFSUploadResult> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const uploadResult = await uploadToIPFS(file, options);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(uploadResult);

      if (!uploadResult.success) {
        setError(uploadResult.error || 'Upload failed');
      }

      return uploadResult;
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      return {
        success: false,
        error: err.message || 'Upload failed',
      };
    } finally {
      setIsUploading(false);
    }
  }, []);

  const uploadJSON = useCallback(async (json: object, name: string): Promise<IPFSUploadResult> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      setProgress(50);
      const uploadResult = await uploadJSONToIPFS(json, name);
      setProgress(100);
      setResult(uploadResult);

      if (!uploadResult.success) {
        setError(uploadResult.error || 'Upload failed');
      }

      return uploadResult;
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      return {
        success: false,
        error: err.message || 'Upload failed',
      };
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    upload,
    uploadJSON,
    isUploading,
    progress,
    error,
    result,
  };
}
