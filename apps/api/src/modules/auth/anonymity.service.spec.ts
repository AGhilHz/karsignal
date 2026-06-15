import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AnonymityService } from './anonymity.service';

describe('AnonymityService', () => {
  let service: AnonymityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnonymityService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, def?: any) => {
              if (key === 'ANONYMIZATION_SALT') return 'test-salt-for-unit-tests';
              if (key === 'ENCRYPTION_KEY') return 'test-encryption-key-32chars!!!!!!';
              return def;
            },
          },
        },
      ],
    }).compile();

    service = module.get<AnonymityService>(AnonymityService);
  });

  describe('generateAnonymousToken', () => {
    it('should generate a deterministic token for the same userId', async () => {
      const token1 = await service.generateAnonymousToken('user-123');
      const token2 = await service.generateAnonymousToken('user-123');
      expect(token1).toBe(token2);
    });

    it('should generate different tokens for different userIds', async () => {
      const token1 = await service.generateAnonymousToken('user-123');
      const token2 = await service.generateAnonymousToken('user-456');
      expect(token1).not.toBe(token2);
    });

    it('should return a hex string of 64 characters (SHA-256)', async () => {
      const token = await service.generateAnonymousToken('user-123');
      expect(token).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should NOT be reversible to the original userId', async () => {
      const userId = 'user-123';
      const token = await service.generateAnonymousToken(userId);
      // Token should not contain the userId
      expect(token).not.toContain(userId);
      // There is no decrypt method for the token
      expect((service as any).reverseToken).toBeUndefined();
    });
  });

  describe('verifyTokenBelongsToUser', () => {
    it('should return true for matching userId and token', async () => {
      const token = await service.generateAnonymousToken('user-123');
      const result = await service.verifyTokenBelongsToUser('user-123', token);
      expect(result).toBe(true);
    });

    it('should return false for non-matching userId and token', async () => {
      const token = await service.generateAnonymousToken('user-123');
      const result = await service.verifyTokenBelongsToUser('user-456', token);
      expect(result).toBe(false);
    });
  });

  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt data correctly', () => {
      const plaintext = 'sensitive data';
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertext each time (random IV)', () => {
      const plaintext = 'same data';
      const enc1 = service.encrypt(plaintext);
      const enc2 = service.encrypt(plaintext);
      expect(enc1).not.toBe(enc2);
    });
  });
});
