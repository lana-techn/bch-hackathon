/**
 * Simple Gun.js database module for scripts (CommonJS compatible)
 */

import Gun from 'gun';

const gun = Gun({
  peers: [
    'https://gun-manhattan.herokuapp.com/gun',
    'https://gun-us.herokuapp.com/gun',
  ],
  localStorage: false,
  radisk: true,
});

const tokensNode = gun.get('IITEBCH_tokens');

export async function saveTokenMetadata(token) {
  return new Promise((resolve, reject) => {
    tokensNode.get(token.id).put(token, (ack) => {
      if (ack?.err) reject(new Error(ack.err));
      else resolve();
    });
  });
}

export async function getTokenMetadata(tokenId) {
  return new Promise((resolve) => {
    tokensNode.get(tokenId).once((data) => {
      resolve(data);
    });
  });
}
