import crypto from 'node:crypto';

// ── Token encryption at rest ────────────────────────────────────────────────
// Calendar refresh/access tokens are long-lived keys to a lawyer's calendar, so
// we never store them in plaintext. We use AES-256-GCM (authenticated
// encryption): it both hides the token AND detects tampering.
//
// The key comes from TOKEN_ENCRYPTION_KEY — 32 bytes as 64 hex characters.
// Generate one with:  npm run gen:key
//
// Stored format is a single base64 string containing: iv (12 bytes) + auth tag
// (16 bytes) + ciphertext. That's all we need to decrypt later.

function getKey(): Buffer {
  const hex = process.env.TOKEN_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      'TOKEN_ENCRYPTION_KEY must be 64 hex characters (32 bytes). Run: npm run gen:key',
    );
  }
  return Buffer.from(hex, 'hex');
}

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decrypt(payload: string | null | undefined): string | null {
  if (!payload) return null;
  const raw = Buffer.from(payload, 'base64');
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const enc = raw.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}
