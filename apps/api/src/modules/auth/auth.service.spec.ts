import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TrustService } from './trust.service';
import { AnonymityService } from './anonymity.service';
import { OtpService } from './otp.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

// Mock PrismaService
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  session: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  verification: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

const mockJwt = {
  signAsync: jest.fn().mockResolvedValue('mock-token'),
};

const mockConfig = {
  get: jest.fn((key: string, def?: any) => {
    const map: Record<string, any> = {
      JWT_SECRET: 'test-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      JWT_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
    };
    return map[key] ?? def;
  }),
};

const mockAnonymity = {
  generateAnonymousToken: jest.fn().mockResolvedValue('mock-anon-token'),
  getAnonymousToken: jest.fn().mockResolvedValue('mock-anon-token'),
};

const mockTrust = {
  recalculateTrustScore: jest.fn().mockResolvedValue(10),
};

const mockOtp = {
  sendEmailOtp: jest.fn().mockResolvedValue(undefined),
  verifyEmailOtp: jest.fn().mockResolvedValue(true),
  sendPhoneOtp: jest.fn().mockResolvedValue(undefined),
  verifyPhoneOtp: jest.fn().mockResolvedValue(true),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
        { provide: AnonymityService, useValue: mockAnonymity },
        { provide: TrustService, useValue: mockTrust },
        { provide: OtpService, useValue: mockOtp },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com' });

      await expect(
        service.register({ email: 'test@test.com', firstName: 'Ali', lastName: 'Test', password: 'Pass@1234' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: '1',
        email: 'new@test.com',
        role: 'USER',
        trustLevel: 'LEVEL_0_UNVERIFIED',
        trustScore: 0,
        passwordHash: 'hash',
        anonymousTokenHash: 'anon',
      });

      const result = await service.register({
        email: 'new@test.com',
        firstName: 'Ali',
        lastName: 'Test',
        password: 'Pass@1234',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user).not.toHaveProperty('anonymousTokenHash');
    });
  });

  describe('validateUser', () => {
    it('should return null for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await service.validateUser('notfound@test.com', 'pass');
      expect(result).toBeNull();
    });

    it('should return null for wrong password', async () => {
      const hash = await bcrypt.hash('correct-pass', 12);
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', passwordHash: hash });
      const result = await service.validateUser('test@test.com', 'wrong-pass');
      expect(result).toBeNull();
    });

    it('should return user for correct credentials', async () => {
      const hash = await bcrypt.hash('correct-pass', 12);
      const user = { id: '1', email: 'test@test.com', passwordHash: hash };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      const result = await service.validateUser('test@test.com', 'correct-pass');
      expect(result).toEqual(user);
    });
  });

  describe('sanitizeUser', () => {
    it('should never expose passwordHash or anonymousTokenHash', () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        passwordHash: 'secret-hash',
        anonymousTokenHash: 'anon-hash',
        role: 'USER',
      };
      const sanitized = service.sanitizeUser(user as any);
      expect(sanitized).not.toHaveProperty('passwordHash');
      expect(sanitized).not.toHaveProperty('anonymousTokenHash');
      expect(sanitized).toHaveProperty('id');
      expect(sanitized).toHaveProperty('email');
    });
  });
});
