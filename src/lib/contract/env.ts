export type NetworkType = 'chipnet' | 'mainnet';

export interface EnvConfig {
  network: NetworkType;
  deployerWif: string;
  feeAddress: string;
  electrumHost?: string;
}

export function loadEnvConfig(): EnvConfig {
  const network = (process.env.NEXT_PUBLIC_NETWORK || 'chipnet') as NetworkType;
  if (network !== 'chipnet' && network !== 'mainnet') {
    throw new Error(`Invalid NEXT_PUBLIC_NETWORK: "${network}". Must be 'chipnet' or 'mainnet'.`);
  }

  const deployerWif = process.env.DEPLOYER_WIF;
  if (!deployerWif) {
    throw new Error(
      'DEPLOYER_WIF is not set.\n' +
      'Generate a WIF key and add it to .env.local.\n' +
      'For chipnet, get test BCH from: https://tbch.googol.cash'
    );
  }

  const feeAddress = process.env.FEE_ADDRESS;
  if (!feeAddress) {
    throw new Error(
      'FEE_ADDRESS is not set.\n' +
      'Set a CashAddress (P2PKH) in .env.local to receive platform fees.'
    );
  }

  return {
    network,
    deployerWif,
    feeAddress,
    electrumHost: process.env.ELECTRUM_HOST || undefined,
  };
}

/**
 * Get the address prefix for the current network.
 */
export function getAddressPrefix(network: NetworkType): string {
  return network === 'mainnet' ? 'bitcoincash' : 'bchtest';
}
