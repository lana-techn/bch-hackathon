/**
 * IITEBCH — Typed Error Classes
 *
 * Structured error hierarchy so callers can distinguish between
 * retryable network failures and hard validation/contract errors.
 */

// ============================================================================
// Base
// ============================================================================

export abstract class AppError extends Error {
    abstract readonly code: string;
    /** HTTP status code suitable for API responses */
    abstract readonly httpStatus: number;
    /** Whether the operation is safe to retry automatically */
    abstract readonly retryable: boolean;

    constructor(message: string, public readonly cause?: unknown) {
        super(message);
        this.name = this.constructor.name;
        // Restore prototype chain (important when targeting ES5)
        Object.setPrototypeOf(this, new.target.prototype);
    }

    toJSON() {
        return {
            code: this.code,
            message: this.message,
            retryable: this.retryable,
        };
    }
}

// ============================================================================
// Network / Infrastructure
// ============================================================================

/**
 * Thrown when an Electrum node or RPC endpoint is unreachable, times out,
 * or returns a transient error. Safe to retry with backoff.
 */
export class NetworkError extends AppError {
    readonly code = 'NETWORK_ERROR';
    readonly httpStatus = 503;
    readonly retryable = true;
}

/**
 * Thrown when a signed transaction is rejected by the p2p network.
 * May or may not be retryable depending on `reason`.
 */
export class BroadcastError extends AppError {
    readonly code = 'BROADCAST_ERROR';
    readonly httpStatus = 502;
    readonly retryable: boolean;

    constructor(message: string, options: { retryable?: boolean; cause?: unknown } = {}) {
        super(message, options.cause);
        this.retryable = options.retryable ?? false;
    }
}

// ============================================================================
// Business / Validation
// ============================================================================

/**
 * Thrown on invalid user input (bad address format, zero amounts, etc.).
 * Never retryable — the user must fix their input.
 */
export class ValidationError extends AppError {
    readonly code = 'VALIDATION_ERROR';
    readonly httpStatus = 400;
    readonly retryable = false;

    constructor(message: string, public readonly field?: string) {
        super(message);
    }

    toJSON() {
        return { ...super.toJSON(), field: this.field };
    }
}

/**
 * Thrown when the user does not have enough BCH or tokens for a trade.
 */
export class InsufficientFundsError extends AppError {
    readonly code = 'INSUFFICIENT_FUNDS';
    readonly httpStatus = 422;
    readonly retryable = false;

    constructor(
        message: string,
        public readonly required?: bigint,
        public readonly available?: bigint,
    ) {
        super(message);
    }

    toJSON() {
        return {
            ...super.toJSON(),
            required: this.required?.toString(),
            available: this.available?.toString(),
        };
    }
}

/**
 * Thrown when the bonding curve UTXO is not found or the curve is in an
 * unexpected state (e.g., already graduated).
 */
export class ContractError extends AppError {
    readonly code = 'CONTRACT_ERROR';
    readonly httpStatus = 409;
    readonly retryable = false;
}

/**
 * Thrown for wallet-related failures (not connected, signing rejected, timeout).
 */
export class WalletError extends AppError {
    readonly code = 'WALLET_ERROR';
    readonly httpStatus = 400;
    readonly retryable = false;

    constructor(
        message: string,
        public readonly kind: 'not_connected' | 'signing_rejected' | 'timeout' | 'not_configured' | 'unknown' = 'unknown',
        cause?: unknown,
    ) {
        super(message, cause);
    }

    toJSON() {
        return { ...super.toJSON(), kind: this.kind };
    }
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Wrap an unknown `catch` value into a typed AppError.
 * Useful in API boundary handlers.
 */
export function toAppError(err: unknown): AppError {
    if (err instanceof AppError) return err;
    if (err instanceof Error) return new NetworkError(err.message, err);
    return new NetworkError(String(err));
}

/**
 * Check whether an error is safe to retry.
 */
export function isRetryable(err: unknown): boolean {
    return err instanceof AppError && err.retryable;
}
