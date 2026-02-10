/**
 * IiteBCH - Token Deployment Script
 *
 * Deploys a new bonding curve token on Bitcoin Cash (chipnet or mainnet).
 *
 * The deployment is a 2-transaction process:
 *
 *   TX 1 (Genesis + Mint):
 *     - Spends a P2PKH UTXO from the deployer wallet
 *     - The txid of this UTXO becomes the new token's category ID
 *     - Creates a minting NFT + 1B fungible tokens in a single output
 *     - Output goes to deployer's token address (temporary holding)
 *
 *   TX 2 (Lock to Bonding Curve):
 *     - Spends the minted tokens from TX 1
 *     - Sends all 800M curve tokens + mutable NFT (commitment=0) to BondingCurve covenant
 *     - Sends 200M DEX reserve tokens to deployer (held until graduation)
 *     - The minting NFT capability is downgraded to mutable
 *
 * Usage:
 *   pnpm deploy:token
 *
 * Prerequisites:
 *   - .env.local with DEPLOYER_WIF, FEE_ADDRESS, NEXT_PUBLIC_NETWORK
 *   - Deployer wallet funded with BCH (at least 10,000 sats for fees)
 *   - For chipnet: get test BCH from https://tbch.googol.cash
 */

import { config as dotenvConfig } from 'dotenv';
// Load .env.local first, then .env as fallback
dotenvConfig({ path: '.env.local' });
dotenvConfig({ path: '.env' });
import {
  Contract,
  TransactionBuilder,
  ElectrumNetworkProvider,
  SignatureTemplate,
  type Utxo,
  type Artifact,
} from 'cashscript';
import { hash160 } from '@cashscript/utils';
import {
  encodeCashAddress,
  decodeCashAddress,
  CashAddressType,
} from '@bitauth/libauth';

import BondingCurveArtifact from '../src/contracts/BondingCurve.json' with { type: 'json' };

import {
  TOTAL_SUPPLY,
  CURVE_SUPPLY,
  DEX_RESERVE_SUPPLY,
  GRADUATION_TARGET_SAT,
  MIN_CONTRACT_BALANCE,
} from '../src/lib/contract/constants.js';

// =============================================================================
// Config
// =============================================================================

interface DeployConfig {
  network: 'chipnet' | 'mainnet';
  deployerWif: string;
  feeAddress: string;
  electrumHost?: string;
}

function loadConfig(): DeployConfig {
  const network = (process.env.NEXT_PUBLIC_NETWORK || 'chipnet') as 'chipnet' | 'mainnet';
  if (network !== 'chipnet' && network !== 'mainnet') {
    throw new Error(`Invalid NEXT_PUBLIC_NETWORK: "${network}"`);
  }

  const deployerWif = process.env.DEPLOYER_WIF;
  if (!deployerWif) {
    throw new Error(
      'DEPLOYER_WIF not set. Add it to .env.local.\n' +
      'Generate a wallet at https://wallet.cashonize.com (switch to chipnet)\n' +
      'Fund it from https://tbch.googol.cash'
    );
  }

  const feeAddress = process.env.FEE_ADDRESS;
  if (!feeAddress) {
    throw new Error('FEE_ADDRESS not set. Add a CashAddress to .env.local.');
  }

  return { network, deployerWif, feeAddress, electrumHost: process.env.ELECTRUM_HOST };
}

// =============================================================================
// Helpers
// =============================================================================

function log(step: string, msg: string) {
  console.log(`\n[${'='.repeat(3)} ${step} ${'='.repeat(3)}] ${msg}`);
}

function logDetail(label: string, value: string | number | bigint) {
  console.log(`  ${label}: ${value}`);
}

/**
 * Derive a CashAddress from a public key hash.
 */
function pubkeyHashToAddress(
  pkHash: Uint8Array,
  network: 'chipnet' | 'mainnet',
  withTokens: boolean,
): string {
  const prefix = network === 'mainnet' ? 'bitcoincash' : 'bchtest';
  const type = withTokens ? CashAddressType.p2pkhWithTokens : CashAddressType.p2pkh;
  const result = encodeCashAddress({ payload: pkHash, prefix, type });

  if (typeof result === 'string') {
    throw new Error(`Failed to encode CashAddress: ${result}`);
  }
  return result.address;
}

/**
 * Extract hash160 from a CashAddress.
 */
function addressToHash160(address: string): Uint8Array {
  const decoded = decodeCashAddress(address);
  if (typeof decoded === 'string') {
    throw new Error(`Invalid CashAddress: ${decoded}`);
  }
  return decoded.payload;
}

/**
 * Reverse byte order of a hex string (txid display format <-> internal format).
 */
function reverseHex(hex: string): string {
  const bytes = hex.match(/.{2}/g);
  if (!bytes) throw new Error(`Invalid hex: ${hex}`);
  return bytes.reverse().join('');
}

/**
 * Convert Uint8Array to hex string.
 */
function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Find the best UTXO for genesis (largest non-token UTXO).
 */
function selectGenesisUtxo(utxos: Utxo[]): Utxo {
  const nonTokenUtxos = utxos.filter(u => !u.token);
  if (nonTokenUtxos.length === 0) {
    throw new Error(
      'No non-token UTXOs found in deployer wallet.\n' +
      'Fund the wallet with BCH first.'
    );
  }
  nonTokenUtxos.sort((a, b) => Number(b.satoshis - a.satoshis));
  return nonTokenUtxos[0];
}

/**
 * Wait for a UTXO to appear at an address, with retries.
 */
async function waitForUtxo(
  provider: InstanceType<typeof ElectrumNetworkProvider>,
  address: string,
  predicate: (u: Utxo) => boolean,
  label: string,
  maxRetries = 10,
  delayMs = 3000,
): Promise<Utxo> {
  for (let i = 0; i < maxRetries; i++) {
    if (i > 0) {
      console.log(`  Waiting for ${label}... (attempt ${i + 1}/${maxRetries})`);
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));

    const utxos = await provider.getUtxos(address);
    const found = utxos.find(predicate);
    if (found) return found;
  }
  throw new Error(`Timed out waiting for ${label} at ${address}`);
}

// =============================================================================
// Main Deployment
// =============================================================================

async function deploy() {
  const config = loadConfig();

  log('INIT', `Deploying new IiteBCH token on ${config.network}`);

  // --- Setup provider and signer ---
  const providerOptions = config.electrumHost
    ? { hostname: config.electrumHost }
    : undefined;
  const provider = new ElectrumNetworkProvider(config.network, providerOptions);
  const signer = new SignatureTemplate(config.deployerWif);
  const deployerPk = signer.getPublicKey();
  const deployerPkHash = hash160(deployerPk);

  // Derive deployer addresses
  const deployerAddress = pubkeyHashToAddress(deployerPkHash, config.network, false);
  const deployerTokenAddress = pubkeyHashToAddress(deployerPkHash, config.network, true);

  log('WALLET', 'Deployer wallet info');
  logDetail('Address', deployerAddress);
  logDetail('Token Address', deployerTokenAddress);
  logDetail('Public Key', toHex(deployerPk));

  // --- Check balance ---
  const utxos = await provider.getUtxos(deployerAddress);
  const totalBalance = utxos.reduce((sum, u) => sum + u.satoshis, 0n);
  logDetail('Balance', `${totalBalance} sats (${Number(totalBalance) / 1e8} BCH)`);
  logDetail('UTXOs', utxos.length.toString());

  if (totalBalance < 10_000n) {
    throw new Error(
      `Insufficient balance: ${totalBalance} sats.\n` +
      `Need at least 10,000 sats for deployment.\n` +
      `Fund the address: ${deployerAddress}`
    );
  }

  // --- Select genesis UTXO ---
  const genesisUtxo = selectGenesisUtxo(utxos);
  const tokenCategory = genesisUtxo.txid;

  log('GENESIS', 'Selected genesis UTXO');
  logDetail('TXID', genesisUtxo.txid);
  logDetail('Vout', genesisUtxo.vout);
  logDetail('Value', `${genesisUtxo.satoshis} sats`);
  logDetail('Token Category (will be)', tokenCategory);

  // --- Extract fee address hash160 ---
  const feeHash160 = addressToHash160(config.feeAddress);

  // --- Instantiate BondingCurve contract ---
  // Constructor: tokenCategory (bytes32), feeAddress (bytes20), slope (int),
  //              graduationTarget (int), curveSupply (int)
  //
  // tokenCategory in the contract uses the "internal" byte order (reversed txid).
  // The contract reads it via tx.inputs[].tokenCategory introspection, which
  // returns the category in internal byte order.
  const tokenCategoryBytes = reverseHex(tokenCategory);

  // slope=1: cost = 1 * (newSq - oldSq) / 200000000
  // At full supply (800M): total cost = (800M)^2 / 2e8 = 3.2e9 sats = 32 BCH
  // With GRADUATION_TARGET = 40 BCH, graduation happens at ~894M tokens (~89% sold)
  const slopeValue = 1n;

  const bondingCurveContract = new Contract(
    BondingCurveArtifact as unknown as Artifact,
    [tokenCategoryBytes, feeHash160, slopeValue, GRADUATION_TARGET_SAT, CURVE_SUPPLY],
    { provider, addressType: 'p2sh32' },
  );

  log('CONTRACT', 'BondingCurve contract instantiated');
  logDetail('Address', bondingCurveContract.address);
  logDetail('Token Address', bondingCurveContract.tokenAddress);
  logDetail('Bytecode size', `${bondingCurveContract.bytesize} bytes`);
  logDetail('Opcount', bondingCurveContract.opcount);

  // =========================================================================
  // TX 1: Genesis + Mint
  // =========================================================================
  log('TX1', 'Building Genesis + Mint transaction');

  const mintDust = 1000n;
  const txFeeEstimate = 500n;
  const changeAmount = genesisUtxo.satoshis - mintDust - txFeeEstimate;

  if (changeAmount < 546n) {
    throw new Error(
      `Genesis UTXO too small. Need at least ${mintDust + txFeeEstimate + 546n} sats, ` +
      `have ${genesisUtxo.satoshis} sats.`
    );
  }

  const tx1Builder = new TransactionBuilder({ provider })
    .addInput(genesisUtxo, signer.unlockP2PKH())
    .addOutput({
      to: deployerTokenAddress,
      amount: mintDust,
      token: {
        amount: TOTAL_SUPPLY,
        category: tokenCategory,
        nft: {
          capability: 'minting' as const,
          commitment: '',
        },
      },
    })
    .addOutput({
      to: deployerAddress,
      amount: changeAmount,
    });

  log('TX1', 'Sending Genesis + Mint transaction...');
  const tx1Result = await tx1Builder.send();

  log('TX1', 'Genesis + Mint CONFIRMED');
  logDetail('TXID', tx1Result.txid);
  logDetail('Token Category', tokenCategory);
  logDetail('Tokens Minted', TOTAL_SUPPLY.toString());

  // =========================================================================
  // TX 2: Lock tokens to BondingCurve covenant
  // =========================================================================
  log('TX2', 'Building Lock-to-Curve transaction');

  // Wait for the minted token UTXO to be visible
  const tokenUtxo = await waitForUtxo(
    provider,
    deployerTokenAddress,
    u => u.token?.category === tokenCategory && u.token?.nft?.capability === 'minting',
    'minted token UTXO',
  );

  logDetail('Minted UTXO txid', tokenUtxo.txid);
  logDetail('Minted UTXO vout', tokenUtxo.vout);
  logDetail('Token amount', tokenUtxo.token!.amount.toString());

  // Get a BCH UTXO for tx fees (might be the change from TX1)
  const bchUtxos = await provider.getUtxos(deployerAddress);
  const feeUtxo = bchUtxos.find(u => !u.token && u.satoshis >= 3000n);
  if (!feeUtxo) {
    throw new Error(
      'No BCH UTXO available for TX2 fees (need >= 3000 sats).\n' +
      'The deployer may need more BCH.'
    );
  }

  // Initial NFT commitment: 0 (no tokens sold yet), encoded as 8 bytes LE
  const initialCommitment = '0000000000000000';

  // Calculate change: feeUtxo value - curve dust - reserve dust - estimated fee
  const curveDust = MIN_CONTRACT_BALANCE; // 1000 sats
  const reserveDust = 1000n;
  const tx2Fee = 600n;
  const tx2Change = feeUtxo.satoshis - curveDust - reserveDust - tx2Fee;

  if (tx2Change < 0n) {
    throw new Error(
      `Fee UTXO too small for TX2. Need at least ${curveDust + reserveDust + tx2Fee + 546n} sats, ` +
      `have ${feeUtxo.satoshis} sats.`
    );
  }

  const tx2Builder = new TransactionBuilder({ provider })
    .addInput(tokenUtxo, signer.unlockP2PKH())
    .addInput(feeUtxo, signer.unlockP2PKH())
    // Output 0: BondingCurve covenant gets 800M tokens + mutable NFT
    .addOutput({
      to: bondingCurveContract.tokenAddress,
      amount: curveDust,
      token: {
        amount: CURVE_SUPPLY,
        category: tokenCategory,
        nft: {
          capability: 'mutable' as const,
          commitment: initialCommitment,
        },
      },
    })
    // Output 1: Deployer keeps 200M DEX reserve tokens (no NFT)
    .addOutput({
      to: deployerTokenAddress,
      amount: reserveDust,
      token: {
        amount: DEX_RESERVE_SUPPLY,
        category: tokenCategory,
      },
    });

  // Output 2: Change back to deployer (if enough)
  if (tx2Change >= 546n) {
    tx2Builder.addOutput({
      to: deployerAddress,
      amount: tx2Change,
    });
  }

  log('TX2', 'Sending Lock-to-Curve transaction...');
  const tx2Result = await tx2Builder.send();

  log('TX2', 'Lock-to-Curve CONFIRMED');
  logDetail('TXID', tx2Result.txid);

  // =========================================================================
  // Summary
  // =========================================================================
  log('DONE', 'Token deployment complete!');
  console.log('\n' + '='.repeat(60));
  console.log('  Token Category:      ', tokenCategory);
  console.log('  BondingCurve Address:', bondingCurveContract.address);
  console.log('  BondingCurve Token:  ', bondingCurveContract.tokenAddress);
  console.log('  Curve Supply:        ', CURVE_SUPPLY.toString(), 'tokens');
  console.log('  DEX Reserve:         ', DEX_RESERVE_SUPPLY.toString(), 'tokens');
  console.log('  Graduation Target:   ', Number(GRADUATION_TARGET_SAT) / 1e8, 'BCH');
  console.log('  Slope:               ', slopeValue.toString());
  console.log('  TX1 (Genesis+Mint):  ', tx1Result.txid);
  console.log('  TX2 (Lock-to-Curve): ', tx2Result.txid);
  console.log('='.repeat(60));

  const explorerBase = config.network === 'chipnet'
    ? 'https://chipnet.imaginary.cash/tx/'
    : 'https://blockchair.com/bitcoin-cash/transaction/';
  console.log(`\n  View TX1: ${explorerBase}${tx1Result.txid}`);
  console.log(`  View TX2: ${explorerBase}${tx2Result.txid}\n`);

  return {
    tokenCategory,
    bondingCurveAddress: bondingCurveContract.address,
    bondingCurveTokenAddress: bondingCurveContract.tokenAddress,
    tx1Txid: tx1Result.txid,
    tx2Txid: tx2Result.txid,
    network: config.network,
  };
}

// =============================================================================
// Run
// =============================================================================

deploy()
  .then(result => {
    console.log('Deployment JSON:', JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('\nDeployment FAILED:', err.message || err);
    if (err.reason) console.error('Reason:', err.reason);
    if (err.bitauthUri) console.error('Debug URI:', err.bitauthUri);
    process.exit(1);
  });
