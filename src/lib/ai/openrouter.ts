export interface ImageGenerateResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export interface TextGenerateResult {
  success: boolean;
  text?: string;
  error?: string;
}

// Model IDs
const FLUX_MODEL = 'black-forest-labs/flux.2-max';
const AURORA_MODEL = 'openrouter/aurora-alpha';

/**
 * Generate token image with FLUX 2 Max (FREE)
 */
export async function generateTokenImageWithFlux(
  name: string,
  ticker: string,
  description: string
): Promise<ImageGenerateResult> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        error: 'OpenRouter API key not configured. Add NEXT_PUBLIC_OPENROUTER_API_KEY to .env.local',
      };
    }

    const prompt = buildTokenImagePrompt(name, ticker, description);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://IITEBCH.app',
        'X-Title': 'IITEBCH Token Generator',
      },
      body: JSON.stringify({
        model: FLUX_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        modalities: ['image'],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error?.message || 'Failed to generate image';

      // Check for specific error types
      if (errorMessage.includes('Insufficient credits')) {
        throw new Error(
          'Insufficient OpenRouter credits. Please add credits at https://openrouter.ai/settings/credits or use a different API key. '
        );
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Extract image from response
    const choice = data.choices?.[0];
    const message = choice?.message;

    // Format 1: OpenRouter FLUX - images array
    if (message?.images && Array.isArray(message.images) && message.images.length > 0) {
      const firstImage = message.images[0];
      if (firstImage?.image_url?.url) {
        return {
          success: true,
          imageUrl: firstImage.image_url.url,
        };
      }
    }

    // Format 2: Direct image_url in message
    if (message?.image_url?.url) {
      return {
        success: true,
        imageUrl: message.image_url.url,
      };
    }

    // Format 3: Array with image_url objects in content
    if (message?.content && Array.isArray(message.content)) {
      const imageContent = message.content.find((c: any) =>
        c.type === 'image_url' || c.image_url
      );
      if (imageContent?.image_url?.url) {
        return {
          success: true,
          imageUrl: imageContent.image_url.url,
        };
      }
    }

    // Format 4: String content with URL
    if (typeof message?.content === 'string' && message.content.length > 100) {
      return {
        success: true,
        imageUrl: message.content, // Sometimes the entire content is the base64 image
      };
    }

    throw new Error('No image URL found in response');
  } catch (error: any) {
    console.error('FLUX generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate image',
    };
  }
}

/**
 * Generate token name suggestions with Aurora Alpha (FREE)
 */
export async function generateTokenNameSuggestions(
  theme?: string,
  count: number = 5
): Promise<TextGenerateResult> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        error: 'OpenRouter API key not configured',
      };
    }

    const prompt = theme
      ? `Generate ${count} catchy cryptocurrency token names and tickers based on the theme "${theme}". Format: "Name (TICKER) - Brief description". Make them fun, memorable, and suitable for memecoins.`
      : `Generate ${count} catchy cryptocurrency token names and tickers. Format: "Name (TICKER) - Brief description". Make them fun, memorable, and suitable for memecoins.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://IITEBCH.app',
        'X-Title': 'IITEBCH Token Generator',
      },
      body: JSON.stringify({
        model: AURORA_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate suggestions');
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    return {
      success: true,
      text: text || 'No suggestions generated',
    };
  } catch (error: any) {
    console.error('Name generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate suggestions',
    };
  }
}

/**
 * Auto-generate token description with Aurora Alpha (FREE)
 */
export async function generateTokenDescription(
  name: string,
  ticker: string,
  theme?: string
): Promise<TextGenerateResult> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        error: 'OpenRouter API key not configured',
      };
    }

    const prompt = theme
      ? `Write a catchy, fun description for a cryptocurrency token called "${name}" (${ticker}) with theme "${theme}". Keep it under 200 characters, make it engaging and suitable for a memecoin. Use emojis if appropriate.`
      : `Write a catchy, fun description for a cryptocurrency token called "${name}" (${ticker}). Keep it under 200 characters, make it engaging and suitable for a memecoin. Use emojis if appropriate.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://IITEBCH.app',
        'X-Title': 'IITEBCH Token Generator',
      },
      body: JSON.stringify({
        model: AURORA_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate description');
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    return {
      success: true,
      text: text || 'No description generated',
    };
  } catch (error: any) {
    console.error('Description generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate description',
    };
  }
}

/**
 * Build optimized prompt for token image
 */
function buildTokenImagePrompt(name: string, ticker: string, description: string): string {
  return `Create a professional cryptocurrency token logo for "${name}" (${ticker}).

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
}

/**
 * Check if OpenRouter is configured
 */
export function isOpenRouterConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
}

/**
 * Get model info
 */
export function getModelInfo() {
  return {
    image: {
      name: 'FLUX.2 Max',
      id: FLUX_MODEL,
      cost: 'FREE',
    },
    text: {
      name: 'Aurora Alpha',
      id: AURORA_MODEL,
      cost: 'FREE',
    },
  };
}
