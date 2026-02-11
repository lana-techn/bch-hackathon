/**
 * Save deployed token to Web3 database (Gun.js)
 * 
 * This script saves the token metadata to the decentralized database
 * so it's accessible across all users and persists in the P2P network.
 */

import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });
import { saveTokenMetadata, getTokenMetadata } from './lib/gun-simple.mjs';

async function saveToken() {
  const tokenId = 'be99ca4cf589b01558f241024040dfce37cdbcf1ab1a4de99d4b0f75409289b9';
  
  const tokenMetadata = {
    id: tokenId,
    name: 'TestToken',
    ticker: 'TEST',
    description: 'First real bonding curve token deployed on chipnet testnet. Created for testing the IgniteBCH protocol.',
    createdAt: '2026-02-11T12:30:00Z',
    updatedAt: new Date().toISOString(),
  };

  console.log('Saving token to Web3 database...');
  console.log('Token ID:', tokenId);
  console.log('Token Name:', tokenMetadata.name);
  console.log('Token Ticker:', tokenMetadata.ticker);
  
  try {
    await saveTokenMetadata(tokenMetadata);
    console.log('\n✅ Token saved successfully to Gun.js database!');
    console.log('\nThe token metadata is now stored in the P2P network and will be');
    console.log('accessible to all users of the IgniteBCH platform.');
    
    // Verify it was saved
    const saved = await getTokenMetadata(tokenId);
    console.log('\nVerification - Retrieved from database:');
    console.log(JSON.stringify(saved, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to save token:', error);
    process.exit(1);
  }
}

saveToken();
