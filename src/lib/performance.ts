/**
 * Performance utilities for IgniteBCH
 */

import { useMemo, ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Debounce function for performance
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttle function for performance
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memoize expensive calculations
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
}

// Image optimization helper
export function getOptimizedImageUrl(
  src: string,
  width: number,
  quality = 80
): string {
  return src;
}

// Measure performance
export function measurePerformance(
  name: string,
  fn: () => void
): void {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start}ms`);
  } else {
    fn();
  }
}

// Web Vitals reporter
export function reportWebVitals(metric: any): void {
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    const body = JSON.stringify(metric);
    const url = '/api/analytics/web-vitals';

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, body);
    } else {
      fetch(url, { body, method: 'POST', keepalive: true });
    }
  }
}

// Simple loading component
function LoadingComponent(): ReactNode {
  return null;
}

// Lazy component with dynamic import
export function createLazyComponent(
  importFn: () => Promise<any>,
  options?: {
    fallback?: React.ReactNode;
    ssr?: boolean;
  }
) {
  return dynamic(importFn, {
    loading: LoadingComponent,
    ssr: options?.ssr ?? true,
  });
}
