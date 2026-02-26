/**
 * Tests for the token launch flow.
 * 
 * Covers:
 * - Address normalization (Bug 1 fix)
 * - Launched token persistence via localStorage (Bug 3 fix)
 * - AI API route request formatting (Bug 2 fix)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ============================================================================
// Bug 1: Address normalization tests
// ============================================================================

describe('normalizeAddress', () => {
    // Dynamic import to avoid server-only issues
    let normalizeAddress: (address: string, network?: 'chipnet' | 'mainnet') => string;
    let verifyAddress: (address: string) => boolean;

    beforeEach(async () => {
        // Mock server-only module
        vi.mock('server-only', () => ({}));
        // Mock retry/timeout utilities
        vi.mock('@/lib/retry', () => ({
            withRetry: vi.fn((fn: any) => fn()),
            withTimeout: vi.fn((promise: any) => promise),
        }));
        // Mock errors module 
        vi.mock('@/lib/errors', () => ({
            NetworkError: class extends Error { constructor(msg: string) { super(msg); } },
            ContractError: class extends Error { constructor(msg: string) { super(msg); } },
            BroadcastError: class extends Error { constructor(msg: string) { super(msg); } },
            InsufficientFundsError: class extends Error { constructor(msg: string) { super(msg); } },
        }));

        const sdk = await import('@/lib/contract/sdk');
        normalizeAddress = sdk.normalizeAddress;
        verifyAddress = sdk.verifyAddress;
    });

    it('should return address unchanged if it already has bchtest: prefix', () => {
        const addr = 'bchtest:qqttvxd9g5yw23q5leregzu5v8vkqajtcsc0klq8fa';
        expect(normalizeAddress(addr)).toBe(addr);
    });

    it('should return address unchanged if it already has bitcoincash: prefix', () => {
        const addr = 'bitcoincash:qqttvxd9g5yw23q5leregzu5v8vkqajtcsc0klq8fa';
        expect(normalizeAddress(addr)).toBe(addr);
    });

    it('should add bchtest: prefix for chipnet addresses without prefix', () => {
        const addrWithoutPrefix = 'qqttvxd9g5yw23q5leregzu5v8vkqajtcsc0klq8fa';
        const result = normalizeAddress(addrWithoutPrefix, 'chipnet');
        expect(result).toBe('bchtest:' + addrWithoutPrefix);
    });

    it('should fall back to valid prefix when specified network prefix fails checksum', () => {
        // This address checksum is valid for bchtest: only, not bitcoincash:
        // So normalizeAddress tries bitcoincash: first (fails checksum), then tries bchtest: (succeeds)
        const addrWithoutPrefix = 'qqttvxd9g5yw23q5leregzu5v8vkqajtcsc0klq8fa';
        const result = normalizeAddress(addrWithoutPrefix, 'mainnet');
        expect(result).toBe('bchtest:' + addrWithoutPrefix);
    });

    it('should return original string for completely invalid addresses', () => {
        const invalid = 'totally_invalid_address';
        expect(normalizeAddress(invalid, 'chipnet')).toBe(invalid);
    });

    it('should handle empty string', () => {
        expect(normalizeAddress('')).toBe('');
    });

    it('verifyAddress should accept addresses with prefix', () => {
        expect(verifyAddress('bchtest:qqttvxd9g5yw23q5leregzu5v8vkqajtcsc0klq8fa')).toBe(true);
    });

    it('verifyAddress should NOW accept addresses without prefix (after fix)', () => {
        expect(verifyAddress('qqttvxd9g5yw23q5leregzu5v8vkqajtcsc0klq8fa')).toBe(true);
    });

    it('verifyAddress should reject garbage strings', () => {
        expect(verifyAddress('not_an_address')).toBe(false);
    });
});

// ============================================================================
// Bug 3: Launched token persistence tests
// ============================================================================

describe('launched-tokens localStorage', () => {
    let saveLaunchedToken: typeof import('@/lib/launched-tokens').saveLaunchedToken;
    let getLaunchedTokens: typeof import('@/lib/launched-tokens').getLaunchedTokens;
    let getLaunchedTokenById: typeof import('@/lib/launched-tokens').getLaunchedTokenById;
    let findTokenById: typeof import('@/lib/launched-tokens').findTokenById;

    const mockToken = {
        id: 'test_token_id_abc123',
        name: 'TestCoin',
        ticker: 'TEST',
        image: '/tokens/default-token.svg',
        description: 'A test token',
        creatorAddress: 'bchtest:qqttvxd9g5yw23q5leregzu5v8vkqajtcsc0klq8fa',
        createdAt: '2026-02-26T12:00:00Z',
        totalSupply: 1_000_000_000,
        currentSupply: 0,
        marketCapBCH: 0,
        priceBCH: 0.000000001,
        priceUSD: 0.0000003,
        change24h: 0,
        volume24hBCH: 0,
        graduationTarget: 40,
        isGraduated: false,
        holders: 1,
        txCount: 1,
    };

    beforeEach(async () => {
        // Clear localStorage
        localStorage.clear();

        // Reset module cache for fresh import
        vi.resetModules();
        const mod = await import('@/lib/launched-tokens');
        saveLaunchedToken = mod.saveLaunchedToken;
        getLaunchedTokens = mod.getLaunchedTokens;
        getLaunchedTokenById = mod.getLaunchedTokenById;
        findTokenById = mod.findTokenById;
    });

    it('should return empty array when no tokens are saved', () => {
        expect(getLaunchedTokens()).toEqual([]);
    });

    it('should save and retrieve a launched token', () => {
        saveLaunchedToken(mockToken);
        const tokens = getLaunchedTokens();
        expect(tokens).toHaveLength(1);
        expect(tokens[0].id).toBe('test_token_id_abc123');
        expect(tokens[0].name).toBe('TestCoin');
    });

    it('should find token by ID', () => {
        saveLaunchedToken(mockToken);
        const found = getLaunchedTokenById('test_token_id_abc123');
        expect(found).toBeDefined();
        expect(found!.ticker).toBe('TEST');
    });

    it('should return undefined for unknown token ID', () => {
        saveLaunchedToken(mockToken);
        expect(getLaunchedTokenById('nonexistent')).toBeUndefined();
    });

    it('should not create duplicates when saving same token twice', () => {
        saveLaunchedToken(mockToken);
        saveLaunchedToken({ ...mockToken, name: 'Updated Name' });
        const tokens = getLaunchedTokens();
        expect(tokens).toHaveLength(1);
        expect(tokens[0].name).toBe('Updated Name');
    });

    it('should save multiple tokens', () => {
        saveLaunchedToken(mockToken);
        saveLaunchedToken({ ...mockToken, id: 'second_token', name: 'SecondToken', ticker: 'SEC' });
        const tokens = getLaunchedTokens();
        expect(tokens).toHaveLength(2);
    });

    it('findTokenById should find mock tokens first', () => {
        const mockTokens = [{ ...mockToken, id: 'mock_1', name: 'MockOne' }];
        const found = findTokenById('mock_1', mockTokens as any);
        expect(found).toBeDefined();
        expect(found!.name).toBe('MockOne');
    });

    it('findTokenById should fall back to launched tokens', () => {
        saveLaunchedToken(mockToken);
        const mockTokens: any[] = [];
        const found = findTokenById('test_token_id_abc123', mockTokens);
        expect(found).toBeDefined();
        expect(found!.name).toBe('TestCoin');
    });
});

// ============================================================================
// Bug 2: AI API route formatting tests (unit test the request shape)
// ============================================================================

describe('AI API request formatting', () => {
    beforeEach(() => {
        vi.resetModules();
        // Mock global fetch
        global.fetch = vi.fn();
    });

    it('generateTokenNameSuggestions should call /api/ai with correct body', async () => {
        (global.fetch as any).mockResolvedValue({
            json: () => Promise.resolve({ success: true, text: 'TestToken (TEST) - A test token' }),
        });

        const { generateTokenNameSuggestions } = await import('@/hooks/useAI');
        const result = await generateTokenNameSuggestions('cats', 3);

        expect(global.fetch).toHaveBeenCalledWith('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'suggestions', theme: 'cats', count: 3 }),
        });
        expect(result.success).toBe(true);
        expect(result.text).toContain('TestToken');
    });

    it('generateTokenDescription should call /api/ai with correct body', async () => {
        (global.fetch as any).mockResolvedValue({
            json: () => Promise.resolve({ success: true, text: 'A cool token for cat lovers 🐱' }),
        });

        const { generateTokenDescription } = await import('@/hooks/useAI');
        const result = await generateTokenDescription('CatCoin', 'CAT', 'cats');

        expect(global.fetch).toHaveBeenCalledWith('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'description', name: 'CatCoin', ticker: 'CAT', theme: 'cats' }),
        });
        expect(result.success).toBe(true);
    });

    it('should return error on fetch failure', async () => {
        (global.fetch as any).mockRejectedValue(new Error('Network error'));

        const { generateTokenNameSuggestions } = await import('@/hooks/useAI');
        const result = await generateTokenNameSuggestions();

        expect(result.success).toBe(false);
        expect(result.error).toContain('Network error');
    });
});
