/**
 * IITEBCH — Retry / Backoff Utility
 *
 * `withRetry` wraps any async function with configurable exponential backoff.
 * Only retries on errors where `isRetryable(err) === true` so that validation
 * and contract errors fail immediately.
 */

import { isRetryable, NetworkError } from './errors';

export interface RetryOptions {
    /** Maximum number of attempts (including the first). Default: 3 */
    maxAttempts?: number;
    /** Base delay in ms before first retry. Default: 300 */
    baseDelayMs?: number;
    /** Maximum delay cap in ms. Default: 10_000 */
    maxDelayMs?: number;
    /** Add ±25% random jitter to delay. Default: true */
    jitter?: boolean;
    /** Called after each failed attempt with the error and next delay. */
    onRetry?: (err: unknown, attempt: number, delayMs: number) => void;
}

/**
 * Execute `fn` and retry on retryable errors with exponential backoff.
 *
 * @example
 * const utxos = await withRetry(() => provider.getUtxos(address));
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {},
): Promise<T> {
    const {
        maxAttempts = 3,
        baseDelayMs = 300,
        maxDelayMs = 10_000,
        jitter = true,
        onRetry,
    } = options;

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err;

            const isLast = attempt >= maxAttempts;
            if (isLast || !isRetryable(err)) {
                throw err;
            }

            // Exponential backoff: base * 2^(attempt-1)
            let delayMs = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
            if (jitter) {
                delayMs = delayMs * (0.75 + Math.random() * 0.5); // ±25%
            }
            delayMs = Math.round(delayMs);

            onRetry?.(err, attempt, delayMs);
            await sleep(delayMs);
        }
    }

    throw lastError;
}

/**
 * Impose a timeout on a promise. Throws a `NetworkError` on timeout.
 *
 * @example
 * const result = await withTimeout(provider.getUtxos(addr), 8000);
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new NetworkError(`Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        promise.then(
            (value) => { clearTimeout(timer); resolve(value); },
            (err) => { clearTimeout(timer); reject(err); },
        );
    });
}

// ─── Internal ────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
