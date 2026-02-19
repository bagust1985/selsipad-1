import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { createHash, randomBytes } from 'crypto';

/**
 * Generate MFA secret for TOTP
 */
export async function generateMFASecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: `SELSIPAD Admin (${email})`,
    issuer: 'SELSIPAD',
    length: 32,
  });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

  return {
    secret: secret.base32,
    qrCodeUrl,
    otpauthUrl: secret.otpauth_url,
  };
}

/**
 * Verify TOTP token
 */
export function verifyTOTP(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1, // Allow ±30 seconds window
  });
}

/**
 * Generate recovery codes (single-use backup codes)
 */
export function generateRecoveryCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Hash recovery code (SHA-256)
 */
export function hashRecoveryCode(code: string): string {
  return createHash('sha256').update(code.toUpperCase()).digest('hex');
}

/**
 * Verify recovery code against hash
 */
export function verifyRecoveryCode(code: string, hash: string): boolean {
  return hashRecoveryCode(code) === hash;
}

/**
 * Simple encryption for MFA secret (use proper KMS in production)
 */
export function encryptMFASecret(secret: string): string {
  // TODO: Implement proper encryption (AES-256-GCM)
  // For now, just base64 encode (NOT SECURE - placeholder)
  return Buffer.from(secret).toString('base64');
}

/**
 * Decrypt MFA secret
 */
export function decryptMFASecret(encrypted: string): string {
  // TODO: Implement proper decryption
  // For now, just base64 decode (matches placeholder above)
  return Buffer.from(encrypted, 'base64').toString('utf-8');
}
