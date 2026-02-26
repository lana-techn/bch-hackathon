/**
 * Test IPFS upload functionality
 * Usage: node scripts/test-ipfs.mjs
 */

import { PinataSDK } from 'pinata';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT || '',
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud',
});

async function testIPFS() {
  console.log('🧪 Testing IPFS upload...\n');

  if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
    console.error('❌ NEXT_PUBLIC_PINATA_JWT not set in .env.local!');
    console.log('\nPlease add:');
    console.log('NEXT_PUBLIC_PINATA_JWT=your_jwt_here');
    console.log('NEXT_PUBLIC_PINATA_GATEWAY=your-gateway.mypinata.cloud');
    process.exit(1);
  }

  console.log('✅ PINATA_JWT found');
  console.log('Gateway:', process.env.NEXT_PUBLIC_PINATA_GATEWAY);

  try {
    // Create test file
    const blob = new Blob(['Hello IITEBCH!'], { type: 'text/plain' });
    const file = new File([blob], 'test.txt', { type: 'text/plain' });

    console.log('\n📤 Uploading test file...');
    const upload = await pinata.upload.public.file(file);

    console.log('\n✅ Upload successful!');
    console.log('CID:', upload.cid);
    console.log('Name:', upload.name);
    console.log('Size:', upload.size, 'bytes');
    console.log('Created:', upload.created_at);
    console.log('Gateway URL:', `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${upload.cid}`);

    return true;
  } catch (error) {
    console.error('\n❌ Upload failed:', error.message);
    console.error(error);
    return false;
  }
}

testIPFS().then(success => {
  process.exit(success ? 0 : 1);
});
