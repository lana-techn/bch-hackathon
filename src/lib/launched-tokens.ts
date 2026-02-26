/**
 * Launched Tokens - localStorage persistence for newly launched tokens.
 * 
 * When a user launches a token via /create, the token data is saved here
 * so it can be viewed at /token/[id] before it appears in any external index.
 */

import type { Token } from '@/types';

const STORAGE_KEY = 'IITEBCH_launched_tokens';

/**
 * Get all launched tokens from localStorage.
 */
export function getLaunchedTokens(): Token[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as Token[];
    } catch {
        return [];
    }
}

/**
 * Get a single launched token by ID.
 */
export function getLaunchedTokenById(id: string): Token | undefined {
    return getLaunchedTokens().find(t => t.id === id);
}

/**
 * Save a newly launched token to localStorage.
 */
export function saveLaunchedToken(token: Token): void {
    if (typeof window === 'undefined') return;
    try {
        const existing = getLaunchedTokens();
        // Avoid duplicates
        const filtered = existing.filter(t => t.id !== token.id);
        filtered.unshift(token); // newest first
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
        console.error('Failed to save launched token:', e);
    }
}

/**
 * Get all tokens (mock + launched), for listing pages.
 */
export function getAllTokens(mockTokens: Token[]): Token[] {
    const launched = getLaunchedTokens();
    // Merge: launched tokens first, then mock tokens (skip duplicates)
    const launchedIds = new Set(launched.map(t => t.id));
    const uniqueMocks = mockTokens.filter(t => !launchedIds.has(t.id));
    return [...launched, ...uniqueMocks];
}

/**
 * Find a token by ID across mock and launched tokens.
 */
export function findTokenById(id: string, mockTokens: Token[]): Token | undefined {
    // Check mock first (faster, no localStorage read)
    const mock = mockTokens.find(t => t.id === id);
    if (mock) return mock;
    // Check launched tokens
    return getLaunchedTokenById(id);
}
