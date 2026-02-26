import { PinataSDK } from 'pinata';

// Initialize Pinata client
const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT || '',
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud',
});

export interface IPFSUploadResult {
  success: boolean;
  cid?: string;
  ipfsUrl?: string;
  gatewayUrl?: string;
  error?: string;
}

/**
 * Upload a file to IPFS via Pinata
 */
export async function uploadToIPFS(
  file: File,
  options?: {
    name?: string;
    metadata?: Record<string, string>;
  }
): Promise<IPFSUploadResult> {
  try {
    // Check if Pinata is configured
    if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
      return {
        success: false,
        error: 'Pinata not configured. Add NEXT_PUBLIC_PINATA_JWT to .env.local',
      };
    }

    // Upload file to Pinata
    const upload = await pinata.upload.public.file(file, {
      metadata: {
        name: options?.name || file.name,
        keyvalues: {
          app: 'IITEBCH',
          type: 'token-image',
          ...options?.metadata,
        },
      },
    });

    const cid = upload.cid;
    const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';
    const gatewayUrl = `https://${gateway}/ipfs/${cid}`;

    return {
      success: true,
      cid,
      ipfsUrl: `ipfs://${cid}`,
      gatewayUrl,
    };
  } catch (error: any) {
    console.error('IPFS upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload to IPFS',
    };
  }
}

/**
 * Upload JSON metadata to IPFS
 */
export async function uploadJSONToIPFS(
  json: object,
  name: string
): Promise<IPFSUploadResult> {
  try {
    if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
      return {
        success: false,
        error: 'Pinata not configured',
      };
    }

    const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
    const file = new File([blob], `${name}.json`, { type: 'application/json' });

    const upload = await pinata.upload.public.file(file, {
      metadata: {
        name: `${name}.json`,
        keyvalues: {
          app: 'IITEBCH',
          type: 'metadata',
        },
      },
    });

    const cid = upload.cid;
    const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';
    const gatewayUrl = `https://${gateway}/ipfs/${cid}`;

    return {
      success: true,
      cid,
      ipfsUrl: `ipfs://${cid}`,
      gatewayUrl,
    };
  } catch (error: any) {
    console.error('IPFS JSON upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload JSON to IPFS',
    };
  }
}

/**
 * Get gateway URL for IPFS hash
 */
export function getIPFSGatewayUrl(cid: string): string {
  // Remove ipfs:// prefix if present
  const hash = cid.replace('ipfs://', '');
  const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';
  return `https://${gateway}/ipfs/${hash}`;
}

/**
 * Check if Pinata is configured
 */
export function isIPFSConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_PINATA_JWT;
}
