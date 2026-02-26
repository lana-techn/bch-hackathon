/**
 * Real Blockchain Deployment Service for IITEBCH
 * 
 * Uses CashScript for smart contract deployment
 * Integrates with BCH network via Electrum
 * Creates 3 transactions: Genesis, Mint, Lock
 */

import {
  Contract,
  TransactionBuilder,
  ElectrumNetworkProvider,
  SignatureTemplate,
  Network
} from 'cashscript';
import { hash160 } from '@cashscript/utils';
import { decodeCashAddress, encodeCashAddress, CashAddressType } from '@bitauth/libauth';

// Contract artifacts
import BondingCurveArtifact from '@/contracts/BondingCurve.json';

// Constants
const TOTAL_SUPPLY = 1000000000n;
const CURVE_SUPPLY = 800000000n;
const DEX_RESERVE_SUPPLY = 200000000n;
const GRADUATION_TARGET_SAT = 4000000000n;
const MIN_CONTRACT_BALANCE = 1000n;
const LAUNCH_FEE_SAT = 500000n; // 0.005 BCH

/**
 * Generate unique token category identifier
 */
function generateUniqueCategory(): string {
  // Use timestamp + random to create unique identifier
  const timestamp = Date.now().toString(16);
  const random = Math.random().toString(16).substring(2, 10);
  return `${timestamp}${random}`;
}

export interface DeploymentConfig {
  network: 'chipnet' | 'mainnet';
  deployerWif: string;
  feeAddress: string;
}

export interface TokenDeploymentResult {
  success: boolean;
  tokenId?: string;
  bondingCurveAddress?: string;
  tokenAddress?: string;
  genesisTxid?: string;
  mintTxid?: string;
  lockTxid?: string;
  error?: string;
}

export interface DeploymentProgress {
  step: 'idle' | 'checking' | 'genesis' | 'mint' | 'lock' | 'complete' | 'error';
  message: string;
  progress: number;
  txHash?: string;
}

/**
 * Decode CashAddress to hash160
 */
function addressToHash160(address: string, network: 'chipnet' | 'mainnet' = 'chipnet'): Uint8Array {
  // Ensure address has proper prefix
  let fullAddress = address;
  if (!address.includes(':')) {
    const prefix = network === 'mainnet' ? 'bitcoincash' : 'bchtest';
    fullAddress = `${prefix}:${address}`;
  }

  const decoded = decodeCashAddress(fullAddress);
  if (typeof decoded === 'string') {
    throw new Error(`Invalid address: ${decoded}`);
  }
  return decoded.payload;
}

/**
 * Reverse hex string (for txids)
 */
function reverseHex(hex: string): string {
  const bytes = hex.match(/.{2}/g);
  if (!bytes) throw new Error(`Invalid hex: ${hex}`);
  return bytes.reverse().join('');
}

/**
 * Get network provider
 */
function getProvider(network: 'chipnet' | 'mainnet') {
  return new ElectrumNetworkProvider(network);
}

/**
 * Deploy token to BCH blockchain
 * 
 * NOTE: This is currently in MOCK mode for demo purposes.
 * Real BCH CashTokens deployment requires complex genesis transaction setup.
 */
export async function deployTokenReal(
  config: DeploymentConfig,
  name: string,
  ticker: string,
  description: string,
  creatorAddress: string,
  onProgress?: (progress: DeploymentProgress) => void
): Promise<TokenDeploymentResult> {
  // MOCK MODE: Simulate deployment for demo
  console.log('MOCK DEPLOYMENT:', { name, ticker, creatorAddress });

  try {
    // Simulate deployment steps
    onProgress?.({
      step: 'checking',
      message: 'Checking wallet balance...',
      progress: 5,
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    onProgress?.({
      step: 'checking',
      message: 'MOCK MODE: Simulating deployment...',
      progress: 10,
    });

    // Generate mock token ID
    const mockTokenId = 'mock_' + Date.now().toString(16) + '_' + Math.random().toString(36).substr(2, 9);
    const mockTxId = 'tx_' + Date.now().toString(16);

    onProgress?.({
      step: 'genesis',
      message: 'Step 1/3: Creating Genesis transaction (MOCK)...',
      progress: 30,
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    onProgress?.({
      step: 'mint',
      message: 'Step 2/3: Minting 1B tokens (MOCK)...',
      progress: 60,
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    onProgress?.({
      step: 'lock',
      message: 'Step 3/3: Locking to bonding curve (MOCK)...',
      progress: 90,
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    onProgress?.({
      step: 'complete',
      message: 'Token launched successfully! (MOCK MODE) 🎉',
      progress: 100,
    });

    return {
      success: true,
      tokenId: mockTokenId,
      bondingCurveAddress: 'bchtest:p' + mockTokenId.substr(0, 30),
      tokenAddress: 'bchtest:r' + mockTokenId.substr(0, 30),
      genesisTxid: mockTxId,
      lockTxid: mockTxId + '_lock',
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Deployment failed',
    };
  }
}

/**
 * REAL DEPLOYMENT - Commented out until CashTokens genesis transaction is properly implemented
 */
export async function deployTokenRealActual(
  config: DeploymentConfig,
  name: string,
  ticker: string,
  description: string,
  creatorAddress: string,
  onProgress?: (progress: DeploymentProgress) => void
): Promise<TokenDeploymentResult> {
  try {
    // Step 1: Initialize provider and signer
    onProgress?.({
      step: 'checking',
      message: 'Connecting to BCH network...',
      progress: 5,
    });

    const provider = getProvider(config.network);
    const signer = new SignatureTemplate(config.deployerWif);
    const deployerPk = signer.getPublicKey();
    const deployerPkHash = hash160(deployerPk);

    // Get deployer address
    const prefix = config.network === 'mainnet' ? 'bitcoincash' : 'bchtest';
    const deployerAddressResult = encodeCashAddress({
      payload: deployerPkHash,
      prefix,
      type: CashAddressType.p2pkh,
    });

    if (typeof deployerAddressResult === 'string') {
      throw new Error(`Failed to encode address: ${deployerAddressResult}`);
    }
    const deployerAddress = deployerAddressResult.address;

    // Check balance
    onProgress?.({
      step: 'checking',
      message: 'Checking wallet balance...',
      progress: 10,
    });

    const utxos = await provider.getUtxos(deployerAddress);
    const totalBalance = utxos.reduce((sum, u) => sum + u.satoshis, 0n);

    if (totalBalance < LAUNCH_FEE_SAT + 10000n) {
      throw new Error(
        `Insufficient balance: ${Number(totalBalance) / 1e8} BCH. Need at least ${Number(LAUNCH_FEE_SAT + 10000n) / 1e8} BCH for deployment.`
      );
    }

    // Select genesis UTXO
    const nonTokenUtxos = utxos.filter(u => !u.token);
    if (nonTokenUtxos.length === 0) {
      throw new Error('No BCH UTXOs available. Please fund your wallet.');
    }

    // Sort by value and pick smallest UTXO that's sufficient for genesis
    // This reduces chance of using an already-spent UTXO
    const minGenesisAmount = 2000n; // Minimum for genesis tx
    const suitableUtxos = nonTokenUtxos.filter(u => u.satoshis >= minGenesisAmount);

    if (suitableUtxos.length === 0) {
      throw new Error('No suitable UTXOs found. Need at least 2000 satoshis.');
    }

    // Sort ascending to pick smallest suitable UTXO
    suitableUtxos.sort((a, b) => Number(a.satoshis - b.satoshis));
    const genesisUtxo = suitableUtxos[0];

    // Generate unique token category based on genesis UTXO + timestamp
    const uniqueSuffix = Date.now().toString(16).slice(-8);
    const tokenCategory = genesisUtxo.txid.slice(0, 56) + uniqueSuffix;

    onProgress?.({
      step: 'genesis',
      message: 'Step 1/3: Preparing Genesis transaction...',
      progress: 15,
    });

    // Step 2: Create BondingCurve contract
    const feeHash160 = addressToHash160(config.feeAddress, config.network);
    const tokenCategoryBytes = reverseHex(tokenCategory);
    const slopeValue = 1n;

    const bondingCurveContract = new Contract(
      BondingCurveArtifact,
      [tokenCategoryBytes, feeHash160, slopeValue, GRADUATION_TARGET_SAT, CURVE_SUPPLY],
      { provider, addressType: 'p2sh32' }
    );

    onProgress?.({
      step: 'genesis',
      message: 'Step 1/3: Building Genesis + Mint transaction...',
      progress: 20,
    });

    // Step 3: Build Genesis + Mint transaction
    const mintDust = 1000n;
    const genesisFee = 1000n;
    const changeAmount = genesisUtxo.satoshis - mintDust - genesisFee;

    if (changeAmount < 546n) {
      throw new Error('Genesis UTXO too small. Need more BCH.');
    }

    const deployerTokenAddressResult = encodeCashAddress({
      payload: deployerPkHash,
      prefix,
      type: CashAddressType.p2pkhWithTokens,
    });

    if (typeof deployerTokenAddressResult === 'string') {
      throw new Error(`Failed to encode token address: ${deployerTokenAddressResult}`);
    }
    const deployerTokenAddress = deployerTokenAddressResult.address;

    const tx1Builder = new TransactionBuilder({ provider })
      .addInput(genesisUtxo, signer.unlockP2PKH())
      .addOutput({
        to: deployerTokenAddress,
        amount: mintDust,
        token: {
          amount: TOTAL_SUPPLY,
          category: tokenCategory,
          nft: { capability: 'minting', commitment: '' },
        },
      })
      .addOutput({ to: deployerAddress, amount: changeAmount });

    onProgress?.({
      step: 'genesis',
      message: 'Step 1/3: Signing Genesis transaction...',
      progress: 30,
    });

    // Note: In browser, we'd need wallet to sign. For now, this is the structure.
    // In real implementation, wallet.signTransaction() would be used.
    const tx1Result = await tx1Builder.send();

    onProgress?.({
      step: 'genesis',
      message: 'Step 1/3: Genesis confirmed! ✅',
      progress: 35,
      txHash: tx1Result.txid,
    });

    // Step 4: Build Lock transaction
    onProgress?.({
      step: 'mint',
      message: 'Step 2/3: Preparing Lock transaction...',
      progress: 45,
    });

    // Wait for token UTXO
    await new Promise(resolve => setTimeout(resolve, 2000));

    const tokenUtxos = await provider.getUtxos(deployerTokenAddress);
    const tokenUtxo = tokenUtxos.find(
      u => u.token?.category === tokenCategory && u.token?.nft?.capability === 'minting'
    );

    if (!tokenUtxo) {
      throw new Error('Token UTXO not found after genesis');
    }

    const bchUtxos = await provider.getUtxos(deployerAddress);
    const feeUtxo = bchUtxos.find(u => !u.token && u.satoshis >= 5000n);

    if (!feeUtxo) {
      throw new Error('No BCH UTXO for lock transaction fees');
    }

    const initialCommitment = '0000000000000000';
    const curveDust = MIN_CONTRACT_BALANCE;
    const reserveDust = 1000n;
    const lockFee = 1000n;
    const lockChange = feeUtxo.satoshis - curveDust - reserveDust - lockFee;

    if (lockChange < 0n) {
      throw new Error('Insufficient funds for lock transaction');
    }

    onProgress?.({
      step: 'lock',
      message: 'Step 3/3: Building Lock transaction...',
      progress: 60,
    });

    const tx2Builder = new TransactionBuilder({ provider })
      .addInput(tokenUtxo, signer.unlockP2PKH())
      .addInput(feeUtxo, signer.unlockP2PKH())
      .addOutput({
        to: bondingCurveContract.tokenAddress,
        amount: curveDust,
        token: {
          amount: CURVE_SUPPLY,
          category: tokenCategory,
          nft: { capability: 'mutable', commitment: initialCommitment },
        },
      })
      .addOutput({
        to: deployerTokenAddress,
        amount: reserveDust,
        token: { amount: DEX_RESERVE_SUPPLY, category: tokenCategory },
      });

    if (lockChange >= 546n) {
      tx2Builder.addOutput({ to: deployerAddress, amount: lockChange });
    }

    onProgress?.({
      step: 'lock',
      message: 'Step 3/3: Signing Lock transaction...',
      progress: 75,
    });

    const tx2Result = await tx2Builder.send();

    onProgress?.({
      step: 'lock',
      message: 'Step 3/3: Lock confirmed! ✅',
      progress: 90,
      txHash: tx2Result.txid,
    });

    // Step 5: Complete
    onProgress?.({
      step: 'complete',
      message: 'Token launched successfully! 🎉',
      progress: 100,
    });

    return {
      success: true,
      tokenId: tokenCategory,
      bondingCurveAddress: bondingCurveContract.address,
      tokenAddress: bondingCurveContract.tokenAddress,
      genesisTxid: tx1Result.txid,
      lockTxid: tx2Result.txid,
    };

  } catch (error: any) {
    console.error('Deployment error:', error);
    onProgress?.({
      step: 'error',
      message: 'Deployment failed',
      progress: 0,
    });
    return {
      success: false,
      error: error.message || 'Unknown deployment error',
    };
  }
}

/**
 * Check if deployment is possible
 */
export async function checkDeploymentRequirements(
  address: string,
  network: 'chipnet' | 'mainnet'
): Promise<{ canDeploy: boolean; balance: bigint; required: bigint; message: string }> {
  try {
    const provider = getProvider(network);

    // Ensure address has proper prefix
    let fullAddress = address;
    if (!address.includes(':')) {
      const prefix = network === 'mainnet' ? 'bitcoincash' : 'bchtest';
      fullAddress = `${prefix}:${address}`;
    }

    const utxos = await provider.getUtxos(fullAddress);
    const balance = utxos.reduce((sum, u) => sum + u.satoshis, 0n);
    const required = LAUNCH_FEE_SAT + 20000n; // Fee + buffer

    if (balance >= required) {
      return {
        canDeploy: true,
        balance,
        required,
        message: `Balance sufficient: ${Number(balance) / 1e8} BCH`,
      };
    } else {
      return {
        canDeploy: false,
        balance,
        required,
        message: `Insufficient balance. Have: ${Number(balance) / 1e8} BCH, Need: ${Number(required) / 1e8} BCH`,
      };
    }
  } catch (error: any) {
    return {
      canDeploy: false,
      balance: 0n,
      required: LAUNCH_FEE_SAT,
      message: `Error checking balance: ${error.message}`,
    };
  }
}
