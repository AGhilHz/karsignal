/**
 * AnonymityService
 *
 * PRIVACY-BY-DESIGN: This service handles the cryptographic separation
 * between user identity and anonymous content.
 *
 * Architecture:
 * - Each user gets a deterministic but one-way anonymous token
 * - Token = HMAC-SHA256(userId + ANONYMIZATION_SALT)
 * - This token is stored on reviews/discussions instead of userId
 * - Even admins cannot reverse the token to find the user
 * - The same user always gets the same token (for rate limiting)
 * - The token is NEVER exposed to the client
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class AnonymityService {
  private readonly salt: string;
  private readonly encryptionKey: string;

  constructor(private config: ConfigService) {
    this.salt = config.get<string>('ANONYMIZATION_SALT', 'default-salt-change-me');
    this.encryptionKey = config.get<string>('ENCRYPTION_KEY', 'default-key-change-me-32chars!!');
  }

  /**
   * Generate a deterministic anonymous token for a user.
   * This is a one-way hash — cannot be reversed to find the user.
   */
  async generateAnonymousToken(userId: string): Promise<string> {
    return crypto
      .createHmac('sha256', this.salt)
      .update(userId)
      .digest('hex');
  }

  /**
   * Get the anonymous token for a user (same as generate, deterministic).
   * Used when submitting anonymous content.
   */
  async getAnonymousToken(userId: string): Promise<string> {
    return this.generateAnonymousToken(userId);
  }

  /**
   * Verify that a given token belongs to a user.
   * Used for rate limiting (prevent same user submitting too many reviews).
   * Does NOT expose which user it is.
   */
  async verifyTokenBelongsToUser(userId: string, token: string): Promise<boolean> {
    const expected = await this.generateAnonymousToken(userId);
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(token, 'hex'),
    );
  }

  /**
   * Encrypt sensitive data at rest (for identity verification documents).
   * Uses AES-256-GCM.
   */
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(this.encryptionKey.padEnd(32).slice(0, 32));
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  /**
   * Decrypt sensitive data.
   */
  decrypt(ciphertext: string): string {
    const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const key = Buffer.from(this.encryptionKey.padEnd(32).slice(0, 32));
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(encrypted) + decipher.final('utf8');
  }

  /**
   * Generate a display name for anonymous content.
   * e.g., "مهندس نرم‌افزار در تهران"
   */
  generateDisplayName(position?: string, city?: string): string {
    if (position && city) return `${position} در ${city}`;
    if (position) return position;
    if (city) return `کاربر از ${city}`;
    return 'کاربر ناشناس';
  }
}
