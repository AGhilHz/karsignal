import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { AnonymityService } from '../auth/anonymity.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private prisma: PrismaService,
    private anonymity: AnonymityService,
    @InjectQueue('moderation') private moderationQueue: Queue,
  ) {}

  async create(userId: string, dto: CreateReviewDto) {
    const anonymousToken = await this.anonymity.getAnonymousToken(userId);

    const existing = await this.prisma.review.findFirst({
      where: {
        companyId: dto.companyId,
        anonymousAuthorToken: anonymousToken,
      },
    });

    if (existing) {
      throw new BadRequestException('شما قبلاً برای این شرکت نظر ثبت کردهاید');
    }

    const company = await this.prisma.company.findUnique({
      where: { id: dto.companyId },
    });
    if (!company) throw new NotFoundException('شرکت یافت نشد');

    const review = await this.prisma.review.create({
      data: {
        companyId: dto.companyId,
        anonymousAuthorToken: anonymousToken,
        position: dto.position,
        department: dto.department,
        city: dto.city,
        employmentType: dto.employmentType,
        startYear: dto.startYear,
        endYear: dto.endYear,
        isCurrent: dto.isCurrent,
        salaryRange: dto.salaryRange,
        ratingOverall: dto.ratingOverall,
        ratingSalary: dto.ratingSalary,
        ratingManagement: dto.ratingManagement,
        ratingGrowth: dto.ratingGrowth,
        ratingCulture: dto.ratingCulture,
        ratingBenefits: dto.ratingBenefits,
        ratingWorkLife: dto.ratingWorkLife,
        pros: dto.pros,
        cons: dto.cons,
        advice: dto.advice,
        fullReview: dto.fullReview,
        status: ContentStatus.PENDING,
      },
    });

    await this.moderationQueue.add('moderate-review', {
      reviewId: review.id,
      content: `${dto.pros} ${dto.cons} ${dto.advice} ${dto.fullReview}`,
    });

    return {
      id: review.id,
      message: 'نظر شما با موفقیت ثبت شد و پس از بررسی منتشر خواهد شد',
    };
  }

  async findRecent(limit = 10) {
    return this.prisma.review.findMany({
      where: { status: ContentStatus.APPROVED },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        position: true,
        ratingOverall: true,
        pros: true,
        cons: true,
        fullReview: true,
        createdAt: true,
        company: {
          select: { name: true, slug: true },
        },
        // NEVER select anonymousAuthorToken in public responses
      },
    });
  }

  async findByCompany(companyId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { companyId, status: ContentStatus.APPROVED },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          position: true,
          department: true,
          city: true,
          employmentType: true,
          startYear: true,
          endYear: true,
          isCurrent: true,
          salaryRange: true,
          ratingOverall: true,
          ratingSalary: true,
          ratingManagement: true,
          ratingGrowth: true,
          ratingCulture: true,
          ratingBenefits: true,
          ratingWorkLife: true,
          pros: true,
          cons: true,
          advice: true,
          fullReview: true,
          isHelpful: true,
          isNotHelpful: true,
          createdAt: true,
          // NEVER select anonymousAuthorToken in public responses
        },
      }),
      this.prisma.review.count({
        where: { companyId, status: ContentStatus.APPROVED },
      }),
    ]);

    return {
      reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCompanyRatingSummary(companyId: string) {
    const result = await this.prisma.review.aggregate({
      where: { companyId, status: ContentStatus.APPROVED },
      _avg: {
        ratingOverall: true,
        ratingSalary: true,
        ratingManagement: true,
        ratingGrowth: true,
        ratingCulture: true,
        ratingBenefits: true,
        ratingWorkLife: true,
      },
      _count: { id: true },
    });

    return {
      overall: result._avg.ratingOverall,
      salary: result._avg.ratingSalary,
      management: result._avg.ratingManagement,
      growth: result._avg.ratingGrowth,
      culture: result._avg.ratingCulture,
      benefits: result._avg.ratingBenefits,
      workLife: result._avg.ratingWorkLife,
      count: result._count.id,
    };
  }

  async voteHelpful(reviewId: string, userId: string, isHelpful: boolean) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('نظر یافت نشد');

    const userToken = await this.anonymity.getAnonymousToken(userId);
    if (review.anonymousAuthorToken === userToken) {
      throw new ForbiddenException('نمیتوانید به نظر خود رأی دهید');
    }

    const existing = await this.prisma.reviewVote.findUnique({
      where: { reviewId_userId: { reviewId, userId } },
    });
    if (existing) throw new ForbiddenException('قبلاً رأی دادهاید');

    await this.prisma.$transaction([
      this.prisma.reviewVote.create({ data: { reviewId, userId, isHelpful } }),
      this.prisma.review.update({
        where: { id: reviewId },
        data: isHelpful ? { isHelpful: { increment: 1 } } : { isNotHelpful: { increment: 1 } },
      }),
    ]);

    return { message: 'رأی شما ثبت شد' };
  }

  async updateCompanyAggregates(companyId: string) {
    const summary = await this.getCompanyRatingSummary(companyId);
    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        overallRating: summary.overall,
        salaryScore: summary.salary,
        managementScore: summary.management,
        growthScore: summary.growth,
        cultureScore: summary.culture,
        workLifeScore: summary.workLife,
        reviewCount: summary.count,
      },
    });
  }
}
