'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@/components/wallet';

export interface DeploymentStatus {
  step: 'idle' | 'checking' | 'pregenesis' | 'genesis' | 'mint' | 'lock' | 'complete' | 'error';
  message: string;
  progress: number;
  txHash?: string;
  explorerUrl?: string;
  error?: string;
}

export interface TokenLaunchParams {
  name: string;
  ticker: string;
  description: string;
  imageUrl?: string;
  totalSupply: number;
  creatorAddress: string;
}

export interface DeploymentResult {
  success: boolean;
  tokenId?: string;
  bondingCurveAddress?: string;
  tokenAddress?: string;
  preGenesisTxid?: string;
  genesisTxid?: string;
  mintTxid?: string;
  lockTxid?: string;
  explorerUrl?: string;
  error?: string;
}

interface UseTokenDeploymentReturn {
  status: DeploymentStatus;
  deploy: (params: TokenLaunchParams) => Promise<DeploymentResult>;
  reset: () => void;
  checkRequirements: (address: string) => Promise<{ canDeploy: boolean; message: string }>;
}

export function useTokenDeployment(): UseTokenDeploymentReturn {
  const { wallet } = useWallet();
  const [status, setStatus] = useState<DeploymentStatus>({
    step: 'idle',
    message: 'Ready to launch',
    progress: 0,
  });

  const reset = useCallback(() => {
    setStatus({
      step: 'idle',
      message: 'Ready to launch',
      progress: 0,
    });
  }, []);

  const checkRequirements = useCallback(async (address: string): Promise<{ canDeploy: boolean; message: string }> => {
    try {
      const response = await fetch(`/api/deploy?address=${encodeURIComponent(address)}`);
      const data = await response.json();
      
      return {
        canDeploy: data.canDeploy,
        message: data.message,
      };
    } catch (error: any) {
      return {
        canDeploy: false,
        message: `Error checking requirements: ${error.message}`,
      };
    }
  }, []);

  const deploy = useCallback(async (params: TokenLaunchParams): Promise<DeploymentResult> => {
    if (!wallet) {
      setStatus({
        step: 'error',
        message: 'Wallet not connected',
        progress: 0,
        error: 'Please connect your wallet first',
      });
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      // Step 1: Check requirements
      setStatus({
        step: 'checking',
        message: 'Checking deployment requirements...',
        progress: 5,
      });

      const requirements = await checkRequirements(params.creatorAddress);
      if (!requirements.canDeploy) {
        throw new Error(requirements.message);
      }

      setStatus({
        step: 'checking',
        message: requirements.message,
        progress: 10,
      });

      // Step 2: Call deployment API
      setStatus({
        step: 'genesis',
        message: 'Initiating token deployment...',
        progress: 15,
      });

      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: params.name,
          ticker: params.ticker,
          description: params.description,
          creatorAddress: params.creatorAddress,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Deployment request failed');
      }

      // Step 3: Simulate progress (in real-time deployment, we'd use WebSocket/SSE)
      setStatus({
        step: 'genesis',
        message: 'Step 1/3: Creating Genesis transaction...',
        progress: 30,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      setStatus({
        step: 'mint',
        message: 'Step 2/3: Minting tokens...',
        progress: 50,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      setStatus({
        step: 'lock',
        message: 'Step 3/3: Locking to bonding curve...',
        progress: 75,
      });

      const result = await response.json();

      if (result.success) {
        setStatus({
          step: 'complete',
          message: 'Token launched successfully! 🎉',
          progress: 100,
          txHash: result.genesisTxid,
          explorerUrl: result.explorerUrl,
        });

        return {
          success: true,
          tokenId: result.tokenId,
          bondingCurveAddress: result.bondingCurveAddress,
          tokenAddress: result.tokenAddress,
          genesisTxid: result.genesisTxid,
          lockTxid: result.lockTxid,
          explorerUrl: result.explorerUrl,
        };
      } else {
        throw new Error(result.error || 'Deployment failed');
      }

    } catch (error: any) {
      console.error('Deployment error:', error);
      setStatus({
        step: 'error',
        message: 'Deployment failed',
        progress: status.progress,
        error: error.message || 'Unknown error occurred',
      });
      return {
        success: false,
        error: error.message || 'Deployment failed',
      };
    }
  }, [wallet, status.progress, checkRequirements]);

  return {
    status,
    deploy,
    reset,
    checkRequirements,
  };
}
