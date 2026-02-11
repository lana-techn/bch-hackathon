'use client';

import { DeploymentStatus } from '@/hooks/useTokenDeployment';

interface DeploymentProgressProps {
  status: DeploymentStatus;
  onClose?: () => void;
}

export function DeploymentProgress({ status, onClose }: DeploymentProgressProps) {
  const getStatusColor = () => {
    switch (status.step) {
      case 'complete':
        return 'text-neon border-neon';
      case 'error':
        return 'text-panic-red border-panic-red';
      default:
        return 'text-warn border-warn';
    }
  };

  const getStatusIcon = () => {
    switch (status.step) {
      case 'complete':
        return (
          <svg className="w-8 h-8 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-8 h-8 text-panic-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <div className="w-8 h-8 border-3 border-warn border-t-transparent rounded-full animate-spin" />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-void/95 flex items-center justify-center p-4">
      <div className="bg-card border-3 border-border brutal-shadow max-w-md w-full p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {getStatusIcon()}
        </div>

        {/* Title */}
        <h3 className={`font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-center mb-4 ${
          status.step === 'complete' ? 'text-neon' : status.step === 'error' ? 'text-panic-red' : 'text-text'
        }`}>
          {status.step === 'complete' 
            ? 'Token Launched! 🚀' 
            : status.step === 'error' 
            ? 'Launch Failed' 
            : 'Deploying Token...'}
        </h3>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full h-3 bg-void border-2 border-border">
            <div 
              className={`h-full transition-all duration-500 ${
                status.step === 'complete' 
                  ? 'bg-neon' 
                  : status.step === 'error' 
                  ? 'bg-panic-red' 
                  : 'bg-warn'
              }`}
              style={{ width: `${status.progress}%` }}
            />
          </div>
          <p className="text-center font-[family-name:var(--font-mono)] text-sm mt-2 text-text-dim">
            {status.progress}%
          </p>
        </div>

        {/* Message */}
        <p className="text-center font-[family-name:var(--font-body)] text-text mb-4">
          {status.message}
        </p>

        {/* Transaction Hash */}
        {status.txHash && (
          <div className="bg-void border border-border p-3 mb-4">
            <p className="text-xs font-mono text-text-dim mb-1">Transaction Hash:</p>
            <p className="text-xs font-mono text-neon break-all">{status.txHash}</p>
            {status.explorerUrl && (
              <a 
                href={status.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-warn hover:text-neon mt-2 inline-block"
              >
                View on Explorer →
              </a>
            )}
          </div>
        )}

        {/* Error */}
        {status.error && (
          <div className="bg-panic-red/10 border border-panic-red p-3 mb-4">
            <p className="text-xs font-mono text-panic-red">{status.error}</p>
          </div>
        )}

        {/* Close Button */}
        {(status.step === 'complete' || status.step === 'error') && onClose && (
          <button
            onClick={onClose}
            className={`w-full brutal-btn font-bold py-3 border-2 transition-colors ${
              status.step === 'complete'
                ? 'bg-neon text-void border-neon hover:bg-neon/90'
                : 'bg-void text-text border-border hover:border-text'
            }`}
          >
            {status.step === 'complete' ? 'View Token' : 'Try Again'}
          </button>
        )}

        {/* Processing indicator */}
        {status.step !== 'complete' && status.step !== 'error' && (
          <p className="text-center text-xs font-mono text-text-dim mt-4">
            Please keep this window open...
          </p>
        )}
      </div>
    </div>
  );
}
