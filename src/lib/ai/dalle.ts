export interface DalleGenerateResult {
  success: boolean;
  imageUrl?: string;
  revisedPrompt?: string;
  error?: string;
}

export interface DalleOptions {
  model?: 'dall-e-3' | 'dall-e-2';
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
}

const DEFAULT_OPTIONS: DalleOptions = {
  model: 'dall-e-3',
  size: '1024x1024',
  quality: 'standard',
  style: 'vivid',
};

/**
 * Generate token image with DALL-E
 */
export async function generateTokenImage(
  name: string,
  ticker: string,
  description: string,
  options: DalleOptions = {}
): Promise<DalleGenerateResult> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        error: 'OpenAI API key not configured. Add OPENAI_API_KEY to .env.local',
      };
    }

    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    // Build prompt
    const prompt = buildTokenPrompt(name, ticker, description);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: mergedOptions.model,
        prompt,
        n: 1,
        size: mergedOptions.size,
        quality: mergedOptions.quality,
        style: mergedOptions.style,
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate image');
    }

    const data = await response.json();
    
    return {
      success: true,
      imageUrl: data.data[0].url,
      revisedPrompt: data.data[0].revised_prompt,
    };
  } catch (error: any) {
    console.error('DALL-E generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate image',
    };
  }
}

/**
 * Build optimized prompt for token image
 */
function buildTokenPrompt(name: string, ticker: string, description: string): string {
  const basePrompt = `Create a professional cryptocurrency token logo for "${name}" (${ticker}).

Token Description: ${description}

Design Requirements:
- Style: Modern, minimalist, suitable for crypto token
- Shape: Circular or square logo, centered composition
- Colors: Vibrant but professional, high contrast
- Background: Clean gradient or solid color
- NO TEXT in the image (logo only)
- Theme: Meme coin aesthetic but professional quality
- Details: High-quality, crisp edges, suitable for 256x256 display

The logo should be eye-catching, memorable, and represent the fun/memetic nature of the token while maintaining professional quality. Suitable for use as a cryptocurrency token icon.`;

  return basePrompt;
}

/**
 * Generate variations dengan style berbeda
 */
export async function generateTokenImageVariations(
  name: string,
  ticker: string,
  description: string,
  count: number = 3
): Promise<DalleGenerateResult[]> {
  const styles = ['vivid', 'natural'];
  const results: DalleGenerateResult[] = [];
  
  for (let i = 0; i < Math.min(count, 4); i++) {
    const result = await generateTokenImage(name, ticker, description, {
      style: styles[i % styles.length] as 'vivid' | 'natural',
    });
    results.push(result);
    
    // Small delay to avoid rate limits
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

export function isDalleConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_OPENAI_API_KEY;
}


export function getDallePricing(): { model: string; cost: string }[] {
  return [
    { model: 'DALL-E 3 (1024x1024)', cost: '$0.040 per image' },
    { model: 'DALL-E 3 (1024x1792)', cost: '$0.080 per image' },
    { model: 'DALL-E 3 (1792x1024)', cost: '$0.080 per image' },
    { model: 'DALL-E 2 (1024x1024)', cost: '$0.020 per image' },
  ];
}
