const crypto = require('crypto');

const FAMILY_CODE = 'CYBER-7575';
const FAMILY_SALT = '_safemind_secure_salt_v1_';

function getPrivateTopic(code, suffix) {
  return 'sm_' + crypto.createHash('sha256').update(code + FAMILY_SALT + suffix).digest('hex').substring(0, 24);
}

const cmdTopic = getPrivateTopic(FAMILY_CODE, 'cmd');
console.log('[*] Derived Private Command Topic:', cmdTopic);

// Test 1: Generate Valid HMAC-SHA256 Payload
function createSignedPayload(action, code, timeOffset = 0) {
  const timestamp = Date.now() + timeOffset;
  const nonce = crypto.randomBytes(8).toString('hex');
  const message = `${action}:${timestamp}:${nonce}`;
  const signature = crypto.createHmac('sha256', code).update(message).digest('hex');

  return { action, timestamp, nonce, signature };
}

async function sendTest() {
  const validPayload = createSignedPayload('ENABLE_PROTECTION', FAMILY_CODE);
  console.log('[*] Sending Valid Signed Payload:', validPayload);

  const res = await fetch(`https://ntfy.sh/${cmdTopic}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validPayload)
  });
  console.log('[+] Published valid payload status:', res.status);

  // Test 2: Tampered Payload
  const tamperedPayload = {
    action: 'EMERGENCY_LOCK',
    timestamp: Date.now(),
    nonce: 'fake_nonce',
    signature: 'deadbeef1234567890abcdef'
  };
  console.log('[*] Sending Tampered / Attacker Payload...');
  await fetch(`https://ntfy.sh/${cmdTopic}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tamperedPayload)
  });
  console.log('[+] Published tampered payload for server rejection test.');
}

sendTest().catch(console.error);
