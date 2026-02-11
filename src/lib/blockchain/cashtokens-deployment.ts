/**
 * REAL CashTokens Deployment Service for IgniteBCH
 * 
 * PROPER IMPLEMENTATION:
 * 1. Create Pre-Genesis transaction (creates vout 0 UTXO)
 * 2. Genesis transaction (spends vout 0, creates minting NFT)
 * 3. Mint transaction (uses minting NFT to create tokens)
 * 4. Lock transaction (locks tokens to bonding curve)
 * 
 * Key insight: Token category = txid of UTXO being spent at input index where vout=0
 */

import { 
  Contract, 
  TransactionBuilder, 
  ElectrumNetworkProvider,
  SignatureTemplate,
} from 'cashscript';
import { hash160 } from '@cashscript/utils';
import { decodeCashAddress, encodeCashAddress, CashAddressType } from '@bitauth/libauth';

import BondingCurveArtifact from '@/contracts/BondingCurve.json';

const TOTAL_SUPPLY = 1000000000n;
const CURVE_SUPPLY = 800000000n;
const DEX_RESERVE_SUPPLY = 200000000n;
const GRADUATION_TARGET_SAT = 4000000000n;
const MIN_CONTRACT_BALANCE = 1000n;
const LAUNCH_FEE_SAT = 500000n;

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
  preGenesisTxid?: string;
  genesisTxid?: string;
  mintTxid?: string;
  lockTxid?: string;
  error?: string;
}

export interface DeploymentProgress {
  step: 'idle' | 'checking' | 'pregenesis' | 'genesis' | 'mint' | 'lock' | 'complete' | 'error';
  message: string;
  progress: number;
  txHash?: string;
  error?: string;
}

function addressToHash160(address: string, network: 'chipnet' | 'mainnet' = 'chipnet'): Uint8Array {
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

function reverseHex(hex: string): string {
  const bytes = hex.match(/.{2}/g);
  if (!bytes) throw new Error(`Invalid hex: ${hex}`);
  return bytes.reverse().join('');
}

function getProvider(network: 'chipnet' | 'mainnet') {
  return new ElectrumNetworkProvider(network);
}

/**
 * Deploy token dengan proper CashTokens genesis flow
 */
export async function deployTokenCashTokens(
  config: DeploymentConfig,
  name: string,
  ticker: string,
  description: string,
  creatorAddress: string,
  onProgress?: (progress: DeploymentProgress) => void
): Promise<TokenDeploymentResult> {
  try {
    // Step 1: Initialize
    onProgress?.({
      step: 'checking',
      message: 'Connecting to BCH network...',
      progress: 5,
    });

    const provider = getProvider(config.network);
    const signer = new SignatureTemplate(config.deployerWif);
    const deployerPk = signer.getPublicKey();
    const deployerPkHash = hash160(deployerPk);

    const prefix = config.network === 'mainnet' ? 'bitcoincash' : 'bchtest';
    
    // Get deployer addresses
    const deployerAddressResult = encodeCashAddress({
      payload: deployerPkHash,
      prefix,
      type: CashAddressType.p2pkh,
    });
    
    if (typeof deployerAddressResult === 'string') {
      throw new Error(`Failed to encode address: ${deployerAddressResult}`);
    }
    const deployerAddress = deployerAddressResult.address;

    const deployerTokenAddressResult = encodeCashAddress({
      payload: deployerPkHash,
      prefix,
      type: CashAddressType.p2pkhWithTokens,
    });
    
    if (typeof deployerTokenAddressResult === 'string') {
      throw new Error(`Failed to encode token address: ${deployerTokenAddressResult}`);
    }
    const deployerTokenAddress = deployerTokenAddressResult.address;

    // Check balance
    onProgress?.({
      step: 'checking',
      message: 'Checking wallet balance...',
      progress: 10,
    });

    const utxos = await provider.getUtxos(deployerAddress);
    const totalBalance = utxos.reduce((sum, u) => sum + u.satoshis, 0n);

    if (totalBalance < LAUNCH_FEE_SAT + 50000n) {
      throw new Error(
        `Insufficient balance: ${Number(totalBalance) / 1e8} BCH. Need at least ${Number(LAUNCH_FEE_SAT + 50000n) / 1e8} BCH.`
      );
    }

    const nonTokenUtxos = utxos.filter(u => !u.token);
    if (nonTokenUtxos.length === 0) {
      throw new Error('No BCH UTXOs available. Please fund your wallet.');
    }

    // Step 2: Create Pre-Genesis Transaction
    // This creates a UTXO at vout 0 which will become the token category
    onProgress?.({
      step: 'pregenesis',
      message: 'Step 1/4: Creating Pre-Genesis transaction...',
      progress: 15,
    });

    const inputUtxo = nonTokenUtxos[0];
    const splitAmount = 2000n; // Small amount for vout 0
    const preGenesisFee = 1000n;
    const preGenesisChange = inputUtxo.satoshis - splitAmount - preGenesisFee;

    if (preGenesisChange < 546n) {
      throw new Error('Input UTXO too small for pre-genesis');
    }

    // Create pre-genesis tx: split input into vout 0 (small) + change
    const preGenesisBuilder = new TransactionBuilder({ provider })
      .addInput(inputUtxo, signer.unlockP2PKH())
      .addOutput({ to: deployerAddress, amount: splitAmount })  // vout 0 - will be token category
      .addOutput({ to: deployerAddress, amount: preGenesisChange });  // vout 1 - change

    onProgress?.({
      step: 'pregenesis',
      message: 'Step 1/4: Signing Pre-Genesis transaction...',
      progress: 20,
    });

    const preGenesisResult = await preGenesisBuilder.send();
    const tokenCategory = preGenesisResult.txid; // This becomes our token category!

    onProgress?.({
      step: 'pregenesis',
      message: 'Step 1/4: Pre-Genesis confirmed! ✅',
      progress: 25,
      txHash: preGenesisResult.txid,
    });

    // Wait for transaction to be mined
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Create Genesis Transaction
    // Spends vout 0 of pre-genesis, creates minting NFT
    onProgress?.({
      step: 'genesis',
      message: 'Step 2/4: Creating Genesis transaction...',
      progress: 30,
    });

    const genesisUtxo = {
      txid: preGenesisResult.txid,
      vout: 0,
      satoshis: splitAmount,
    };

    const genesisMintDust = 1000n;
    const genesisFee = 1000n;

    const genesisBuilder = new TransactionBuilder({ provider })
      .addInput(genesisUtxo, signer.unlockP2PKH())
      .addOutput({
        to: deployerTokenAddress,
        amount: genesisMintDust,
        token: {
          amount: 0n, // No fungible tokens in genesis, just NFT
          category: tokenCategory,
          nft: { capability: 'minting', commitment: '' },
        },
      });

    onProgress?.({
      step: 'genesis',
      message: 'Step 2/4: Signing Genesis transaction...',
      progress: 35,
    });

    const genesisResult = await genesisBuilder.send();

    onProgress?.({
      step: 'genesis',
      message: 'Step 2/4: Genesis confirmed! ✅',
      progress: 40,
      txHash: genesisResult.txid,
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 4: Create BondingCurve contract
    const feeHash160 = addressToHash160(config.feeAddress, config.network);
    const tokenCategoryBytes = reverseHex(tokenCategory);
    const slopeValue = 1n;

    const bondingCurveContract = new Contract(
      BondingCurveArtifact,
      [tokenCategoryBytes, feeHash160, slopeValue, GRADUATION_TARGET_SAT, CURVE_SUPPLY],
      { provider, addressType: 'p2sh32' }
    );

    // Step 5: Create Mint Transaction
    // Uses the minting NFT to create all tokens
    onProgress?.({
      step: 'mint',
      message: 'Step 3/4: Minting 1B tokens...',
      progress: 50,
    });

    // Get the minting NFT UTXO
    const tokenUtxos = await provider.getUtxos(deployerTokenAddress);
    const mintingNftUtxo = tokenUtxos.find(
      u => u.token?.category === tokenCategory && u.token?.nft?.capability === 'minting'
    );

    if (!mintingNftUtxo) {
      throw new Error('Minting NFT UTXO not found after genesis');
    }

    // Get fee UTXO
    const bchUtxos = await provider.getUtxos(deployerAddress);
    const feeUtxo = bchUtxos.find(u => !u.token && u.satoshis >= 5000n);

    if (!feeUtxo) {
      throw new Error('No BCH UTXO for mint transaction fees');
    }

    const mintDust = 1000n;
    const mintFee = 1000n;
    const mintChange = feeUtxo.satoshis - mintDust - mintFee;

    const mintBuilder = new TransactionBuilder({ provider })
      .addInput(mintingNftUtxo, signer.unlockP2PKH())
      .addInput(feeUtxo, signer.unlockP2PKH())
      .addOutput({
        to: deployerTokenAddress,
        amount: mintDust,
        token: {
          amount: TOTAL_SUPPLY,
          category: tokenCategory,
          nft: { capability: 'minting', commitment: '' }, // Keep minting capability
        },
      });

    if (mintChange >= 546n) {
      mintBuilder.addOutput({ to: deployerAddress, amount: mintChange });
    }

    onProgress?.({
      step: 'mint',
      message: 'Step 3/4: Signing Mint transaction...',
      progress: 60,
    });

    const mintResult = await mintBuilder.send();

    onProgress?.({
      step: 'mint',
      message: 'Step 3/4: Mint confirmed! ✅',
      progress: 70,
      txHash: mintResult.txid,
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 6: Create Lock Transaction
    onProgress?.({
      step: 'lock',
      message: 'Step 4/4: Locking to bonding curve...',
      progress: 75,
    });

    // Get token UTXO with all supply
    const finalTokenUtxos = await provider.getUtxos(deployerTokenAddress);
    const fullSupplyUtxo = finalTokenUtxos.find(
      u => u.token?.category === tokenCategory && u.token?.amount === TOTAL_SUPPLY
    );

    if (!fullSupplyUtxo) {
      throw new Error('Full supply UTXO not found');
    }

    // Get another fee UTXO
    const finalBchUtxos = await provider.getUtxos(deployerAddress);
    const lockFeeUtxo = finalBchUtxos.find(u => !u.token && u.satoshis >= 5000n);

    if (!lockFeeUtxo) {
      throw new Error('No BCH UTXO for lock transaction fees');
    }

    const curveDust = MIN_CONTRACT_BALANCE;
    const reserveDust = 1000n;
    const lockFee = 1000n;
    const lockChange = lockFeeUtxo.satoshis - curveDust - reserveDust - lockFee;

    const initialCommitment = '0000000000000000';

    const lockBuilder = new TransactionBuilder({ provider })
      .addInput(fullSupplyUtxo, signer.unlockP2PKH())
      .addInput(lockFeeUtxo, signer.unlockP2PKH())
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
      lockBuilder.addOutput({ to: deployerAddress, amount: lockChange });
    }

    onProgress?.({
      step: 'lock',
      message: 'Step 4/4: Signing Lock transaction...',
      progress: 85,
    });

    const lockResult = await lockBuilder.send();

    onProgress?.({
      step: 'lock',
      message: 'Step 4/4: Lock confirmed! ✅',
      progress: 95,
      txHash: lockResult.txid,
    });

    // Step 7: Complete
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
      preGenesisTxid: preGenesisResult.txid,
      genesisTxid: genesisResult.txid,
      mintTxid: mintResult.txid,
      lockTxid: lockResult.txid,
    };

  } catch (error: any) {
    console.error('CashTokens deployment error:', error);
    onProgress?.({
      step: 'error',
      message: 'Deployment failed',
      progress: 0,
      error: error.message || 'Unknown error',
    });
    return {
      success: false,
      error: error.message || 'Deployment failed',
    };
  }
}

/**
 * Check deployment requirements
 */
export async function checkDeploymentRequirements(
  address: string,
  network: 'chipnet' | 'mainnet'
): Promise<{ canDeploy: boolean; balance: bigint; required: bigint; message: string }> {
  try {
    const provider = getProvider(network);
    
    let fullAddress = address;
    if (!address.includes(':')) {
      const prefix = network === 'mainnet' ? 'bitcoincash' : 'bchtest';
      fullAddress = `${prefix}:${address}`;
    }
    
    const utxos = await provider.getUtxos(fullAddress);
    const balance = utxos.reduce((sum, u) => sum + u.satoshis, 0n);
    const required = LAUNCH_FEE_SAT + 50000n;

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
