import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AnonymityService } from '../auth/anonymity.service';

const mockPrisma = {
  review: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    update: jest.fn(),
  },
  company: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockAnonymity = {
  getAnonymousToken: jest.fn().mockResolvedValue('anon-token-abc123'),
};

const mockQueue = {
  add: jest.fn().mockResolvedValue({}),
};

describe('ReviewsService', () => {
  let service: ReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AnonymityService, useValue: mockAnonymity },
        { provide: getQueueToken('moderation'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = {
      companyId: 'company-1',
      position: 'مهندس نرم‌افزار',
      ratingOverall: 4,
      ratingSalary: 3,
      ratingManagement: 4,
      ratingGrowth: 3,
      ratingCulture: 4,
      ratingBenefits: 3,
      ratingWorkLife: 4,
    };

    it('should throw BadRequestException if user already reviewed this company', async () => {
      mockPrisma.review.findFirst.mockResolvedValue({ id: 'existing-review' });
      mockPrisma.company.findUnique.mockResolvedValue({ id: 'company-1' });

      await expect(service.create('user-1', dto as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if company does not exist', async () => {
      mockPrisma.review.findFirst.mockResolvedValue(null);
      mockPrisma.company.findUnique.mockResolvedValue(null);

      await expect(service.create('user-1', dto as any)).rejects.toThrow(NotFoundException);
    });

    it('should create review with anonymousToken, NOT userId', async () => {
      mockPrisma.review.findFirst.mockResolvedValue(null);
      mockPrisma.company.findUnique.mockResolvedValue({ id: 'company-1' });
      mockPrisma.review.create.mockResolvedValue({ id: 'new-review' });

      await service.create('user-1', dto as any);

      const createCall = mockPrisma.review.create.mock.calls[0][0];
      // Must use anonymousToken, NOT userId
      expect(createCall.data.anonymousAuthorToken).toBe('anon-token-abc123');
      expect(createCall.data).not.toHaveProperty('userId');
    });

    it('should queue moderation job after creating review', async () => {
      mockPrisma.review.findFirst.mockResolvedValue(null);
      mockPrisma.company.findUnique.mockResolvedValue({ id: 'company-1' });
      mockPrisma.review.create.mockResolvedValue({ id: 'new-review' });

      await service.create('user-1', dto as any);

      expect(mockQueue.add).toHaveBeenCalledWith(
        'moderate-review',
        expect.objectContaining({ reviewId: 'new-review' }),
      );
    });
  });

  describe('findByCompany', () => {
    it('should never return anonymousAuthorToken in results', async () => {
      mockPrisma.review.findMany.mockResolvedValue([
        { id: '1', position: 'Dev', ratingOverall: 4, pros: 'good', createdAt: new Date() },
      ]);
      mockPrisma.review.count.mockResolvedValue(1);

      const result = await service.findByCompany('company-1');

      result.reviews.forEach((review: any) => {
        expect(review).not.toHaveProperty('anonymousAuthorToken');
      });
    });
  });
});
