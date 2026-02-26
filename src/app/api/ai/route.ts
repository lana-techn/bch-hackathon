/**
 * AI Generation API Route (Server-side proxy for OpenRouter)
 * 
 * POST /api/ai
 * 
 * Actions:
 *   - suggestions: Generate token name suggestions
 *   - description: Generate token description
 *   - image: Generate token image
 * 
 * This runs server-side to avoid CORS issues with OpenRouter API.
 */

import { NextRequest, NextResponse } from 'next/server';

const TEXT_MODELS = [
    'deepseek/deepseek-r1-0528:free',
    'nvidia/nemotron-nano-9b-v2:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'openrouter/free',
];
const FLUX_MODEL = 'black-forest-labs/flux.2-max';

function getApiKey(): string | null {
    return process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || null;
}

async function callOpenRouter(
    model: string,
    messages: Array<{ role: string; content: string }>,
    extraBody?: Record<string, unknown>,
): Promise<Response> {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('OpenRouter API key not configured');

    return fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://IITEBCH.app',
            'X-Title': 'IITEBCH Token Generator',
        },
        body: JSON.stringify({
            model,
            messages,
            ...extraBody,
        }),
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        if (!getApiKey()) {
            return NextResponse.json(
                { success: false, error: 'OpenRouter API key not configured. Add NEXT_PUBLIC_OPENROUTER_API_KEY to .env.local' },
                { status: 500 },
            );
        }

        // ── Token name suggestions ─────────────────────────────────────────────
        if (action === 'suggestions') {
            const { theme, count = 5 } = body;
            const prompt = theme
                ? `Generate ${count} catchy cryptocurrency token names and tickers based on the theme "${theme}". Format: "Name (TICKER) - Brief description". Make them fun, memorable, and suitable for memecoins.`
                : `Generate ${count} catchy cryptocurrency token names and tickers. Format: "Name (TICKER) - Brief description". Make them fun, memorable, and suitable for memecoins.`;

            // Try each model until one works
            let lastError = '';
            for (const model of TEXT_MODELS) {
                try {
                    const response = await callOpenRouter(model, [{ role: 'user', content: prompt }]);

                    if (!response.ok) {
                        const error = await response.json().catch(() => ({}));
                        lastError = error?.error?.message || `OpenRouter error ${response.status} with model ${model}`;
                        console.warn(`AI suggestions: model ${model} failed:`, lastError);
                        continue; // try next model
                    }

                    const data = await response.json();
                    const text = data.choices?.[0]?.message?.content;
                    return NextResponse.json({ success: true, text: text || 'No suggestions generated' });
                } catch (err: any) {
                    lastError = err.message;
                    console.warn(`AI suggestions: model ${model} threw:`, err.message);
                    continue;
                }
            }
            return NextResponse.json(
                { success: false, error: `All models failed. Last error: ${lastError}` },
                { status: 502 },
            );
        }

        // ── Token description ──────────────────────────────────────────────────
        if (action === 'description') {
            const { name, ticker, theme } = body;
            if (!name || !ticker) {
                return NextResponse.json({ success: false, error: 'Name and ticker required' }, { status: 400 });
            }

            const prompt = theme
                ? `Write a catchy, fun description for a cryptocurrency token called "${name}" (${ticker}) with theme "${theme}". Keep it under 200 characters, make it engaging and suitable for a memecoin. Use emojis if appropriate.`
                : `Write a catchy, fun description for a cryptocurrency token called "${name}" (${ticker}). Keep it under 200 characters, make it engaging and suitable for a memecoin. Use emojis if appropriate.`;

            // Try each model until one works
            let lastError = '';
            for (const model of TEXT_MODELS) {
                try {
                    const response = await callOpenRouter(model, [{ role: 'user', content: prompt }]);

                    if (!response.ok) {
                        const error = await response.json().catch(() => ({}));
                        lastError = error?.error?.message || `OpenRouter error ${response.status} with model ${model}`;
                        console.warn(`AI description: model ${model} failed:`, lastError);
                        continue;
                    }

                    const data = await response.json();
                    const text = data.choices?.[0]?.message?.content;
                    return NextResponse.json({ success: true, text: text || 'No description generated' });
                } catch (err: any) {
                    lastError = err.message;
                    console.warn(`AI description: model ${model} threw:`, err.message);
                    continue;
                }
            }
            return NextResponse.json(
                { success: false, error: `All models failed. Last error: ${lastError}` },
                { status: 502 },
            );
        }

        // ── Token image generation ─────────────────────────────────────────────
        if (action === 'image') {
            const { name, ticker, description } = body;
            if (!name || !ticker) {
                return NextResponse.json({ success: false, error: 'Name and ticker required' }, { status: 400 });
            }

            const prompt = `Create a professional cryptocurrency token logo for "${name}" (${ticker}).

Token Description: ${description || 'A fun memecoin on Bitcoin Cash'}

Design Requirements:
- Style: Modern, minimalist, suitable for crypto token
- Shape: Circular or square logo, centered composition
- Colors: Vibrant but professional, high contrast
- Background: Clean gradient or solid color
- NO TEXT in the image (logo only)
- Theme: Meme coin aesthetic but professional quality
- Details: High-quality, crisp edges, suitable for 256x256 display

The logo should be eye-catching, memorable, and represent the fun/memetic nature of the token while maintaining professional quality. Suitable for use as a cryptocurrency token icon.`;

            const response = await callOpenRouter(
                FLUX_MODEL,
                [{ role: 'user', content: prompt }],
                { modalities: ['image'] },
            );

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                const errorMessage = error?.error?.message || `OpenRouter error: ${response.status}`;

                if (errorMessage.includes('Insufficient credits')) {
                    return NextResponse.json(
                        { success: false, error: 'Insufficient OpenRouter credits. Please add credits at https://openrouter.ai/settings/credits' },
                        { status: 402 },
                    );
                }

                return NextResponse.json({ success: false, error: errorMessage }, { status: response.status });
            }

            const data = await response.json();
            const choice = data.choices?.[0];
            const message = choice?.message;

            // Try various response formats
            let imageUrl: string | null = null;

            if (message?.images?.[0]?.image_url?.url) {
                imageUrl = message.images[0].image_url.url;
            } else if (message?.image_url?.url) {
                imageUrl = message.image_url.url;
            } else if (Array.isArray(message?.content)) {
                const img = message.content.find((c: any) => c.type === 'image_url' || c.image_url);
                if (img?.image_url?.url) imageUrl = img.image_url.url;
            } else if (typeof message?.content === 'string' && message.content.length > 100) {
                imageUrl = message.content;
            }

            if (!imageUrl) {
                return NextResponse.json({ success: false, error: 'No image URL in response' }, { status: 500 });
            }

            return NextResponse.json({ success: true, imageUrl });
        }

        return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
    } catch (error: any) {
        console.error('AI API error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'AI generation failed' },
            { status: 500 },
        );
    }
}
