import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * @param text The plaintext string to encrypt.
 * @returns The encrypted string in the format: iv:salt:authTag:encryptedText
 */
export function encrypt(text: string): string {
  const secretKey = process.env.ENCRYPTION_SECRET;
  if (!secretKey) {
    throw new Error('ENCRYPTION_SECRET environment variable is missing.');
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);

  // Derive a 32-byte key from the secret using scrypt
  const key = crypto.scryptSync(secretKey, salt, 32);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${salt.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts a ciphertext string that was encrypted using AES-256-GCM.
 * @param encryptedText The ciphertext string in the format: iv:salt:authTag:encryptedText
 * @returns The decrypted plaintext string.
 */
export function decrypt(encryptedText: string): string {
  const secretKey = process.env.ENCRYPTION_SECRET;
  if (!secretKey) {
    throw new Error('ENCRYPTION_SECRET environment variable is missing.');
  }

  const parts = encryptedText.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted text format.');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const salt = Buffer.from(parts[1], 'hex');
  const tag = Buffer.from(parts[2], 'hex');
  const encrypted = Buffer.from(parts[3], 'hex');

  // Derive the 32-byte key using the same secret and salt
  const key = crypto.scryptSync(secretKey, salt, 32);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
