export interface ImageGenerateResult {
  success: boolean;
  imageUrl?: string;
  modelUsed?: string;
  error?: string;
}

const DALLE_MODEL = 'dall-e-3';
const FLUX_MODEL = 'black-forest-labs/flux.2-max';

/**
 * Generate token image - tries DALL-E first, falls back to FLUX
 */
export async function generateTokenImage(
  name: string,
  ticker: string,
  description: string
): Promise<ImageGenerateResult> {
  // Try DALL-E first
  const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  if (openaiKey) {
    try {
      console.log('Trying DALL-E 3...');
      const result = await generateWithDalle(name, ticker, description, openaiKey);
      if (result.success) {
        return { ...result, modelUsed: 'DALL-E 3' };
      }
    } catch (error: any) {
      console.log('DALL-E failed:', error.message);
    }
  }
  
  // Fallback to FLUX
  const openrouterKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  
  if (openrouterKey) {
    try {
      console.log('Falling back to FLUX...');
      const result = await generateWithFlux(name, ticker, description, openrouterKey);
      if (result.success) {
        return { ...result, modelUsed: 'FLUX.2 Max' };
      }
    } catch (error: any) {
      console.log('FLUX failed:', error.message);
    }
  }
  
  return {
    success: false,
    error: 'All image generation services failed. Please check your API keys or try manual upload.',
  };
}

/**
 * Generate with OpenAI DALL-E
 */
async function generateWithDalle(
  name: string,
  ticker: string,
  description: string,
  apiKey: string
): Promise<ImageGenerateResult> {
  const prompt = buildTokenPrompt(name, ticker, description);

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DALLE_MODEL,
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    const errorMessage = error.error?.message || 'DALL-E request failed';
    
    if (errorMessage.includes('insufficient_quota') || errorMessage.includes('billing')) {
      throw new Error('DALL-E billing issue: ' + errorMessage);
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  if (data.data?.[0]?.url) {
    return {
      success: true,
      imageUrl: data.data[0].url,
    };
  }

  throw new Error('No image URL in DALL-E response');
}

/**
 * Generate with OpenRouter FLUX (fallback)
 */
async function generateWithFlux(
  name: string,
  ticker: string,
  description: string,
  apiKey: string
): Promise<ImageGenerateResult> {
  const prompt = buildTokenPrompt(name, ticker, description);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://ignitebch.app',
      'X-Title': 'IgniteBCH Token Generator',
    },
    body: JSON.stringify({
      model: FLUX_MODEL,
      messages: [{ role: 'user', content: prompt }],
      modalities: ['image'],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    const errorMessage = error.error?.message || 'FLUX request failed';
    
    if (errorMessage.includes('Insufficient credits')) {
      throw new Error('FLUX: Insufficient credits');
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // Extract image from FLUX response
  const choice = data.choices?.[0];
  
  if (choice?.message?.images?.[0]?.image_url?.url) {
    return {
      success: true,
      imageUrl: choice.message.images[0].image_url.url,
    };
  }
  
  if (choice?.message?.image_url?.url) {
    return {
      success: true,
      imageUrl: choice.message.image_url.url,
    };
  }

  throw new Error('No image URL in FLUX response');
}

/**
 * Build optimized prompt
 */
function buildTokenPrompt(name: string, ticker: string, description: string): string {
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
 * Check which AI services are available
 */
export function getAvailableAIServices(): { 
  dalle: boolean; 
  flux: boolean; 
  primary: string;
} {
  const dalle = !!process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const flux = !!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  
  return {
    dalle,
    flux,
    primary: dalle ? 'DALL-E 3' : flux ? 'FLUX.2 Max' : 'None',
  };
}

/**
 * Get service info
 */
export function getModelInfo() {
  const services = getAvailableAIServices();
  
  return {
    image: {
      name: services.primary,
      fallback: services.dalle && services.flux ? 'FLUX.2 Max' : undefined,
      cost: services.dalle ? '~$0.04' : services.flux ? '~$0.04 (credits)' : 'N/A',
    },
  };
}
