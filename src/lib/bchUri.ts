/**
 * IgniteBCH — BCH Payment URI Helpers
 *
 * Generates BIP-21 compatible URIs for BCH payments.
 * Used to open Cashonize / Paytaca with pre-filled payment details.
 */

const SATOSHIS_PER_BCH = 100_000_000n;

/**
 * Convert satoshis to BCH string with 8 decimal places.
 */
export function satsToBchString(satoshis: bigint): string {
    const whole = satoshis / SATOSHIS_PER_BCH;
    const remainder = satoshis % SATOSHIS_PER_BCH;
    return `${whole}.${remainder.toString().padStart(8, '0')}`;
}

/**
 * Build a BIP-21 BCH payment URI.
 * Format: bitcoincash:<address>?amount=<BCH>&label=<label>&message=<msg>
 */
export function buildBchPaymentUri(
    address: string,
    amountSatoshis: bigint,
    label?: string,
    message?: string,
): string {
    // Strip prefix for URI
    const bare = address.replace('bitcoincash:', '').replace('bchtest:', '');
    const prefix = address.startsWith('bchtest:') ? 'bchtest' : 'bitcoincash';

    const params = new URLSearchParams();
    params.set('amount', satsToBchString(amountSatoshis));
    if (label) params.set('label', label);
    if (message) params.set('message', message);

    return `${prefix}:${bare}?${params.toString()}`;
}

/**
 * Open Cashonize web wallet with a pre-filled payment URI.
 * Cashonize accepts BIP-21 URIs as a hash parameter.
 */
export function openCashonizeWithUri(paymentUri: string): void {
    if (typeof window === 'undefined') return;
    const encodedUri = encodeURIComponent(paymentUri);
    window.open(`https://cashonize.com/#send?paymentUri=${encodedUri}`, '_blank');
}

/**
 * Open Paytaca web wallet as fallback (direct URL).
 */
export function openPaytacaWithAmount(address: string, amountSatoshis: bigint): void {
    if (typeof window === 'undefined') return;
    const bch = satsToBchString(amountSatoshis);
    window.open(`https://app.paytaca.com/send?to=${address}&amount=${bch}`, '_blank');
}
