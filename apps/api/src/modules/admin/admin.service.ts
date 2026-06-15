import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [users, companies, jobs, reviews, pendingReviews] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.company.count(),
      this.prisma.job.count({ where: { status: 'ACTIVE' } }),
      this.prisma.review.count({ where: { status: ContentStatus.APPROVED } }),
      this.prisma.review.count({ where: { status: ContentStatus.PENDING } }),
    ]);

    return { users, companies, activeJobs: jobs, approvedReviews: reviews, pendingReviews };
  }

  async getPendingReviews(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.prisma.review.findMany({
      where: { status: ContentStatus.PENDING },
      skip, take: limit,
      orderBy: { createdAt: 'asc' },
      select: {
        id: true, position: true, pros: true, cons: true,
        ratingOverall: true, aiSpamScore: true, aiToxicityScore: true,
        createdAt: true,
        company: { select: { name: true } },
        // NEVER select anonymousAuthorToken
      },
    });
  }

  async moderateReview(moderatorId: string, reviewId: string, action: 'approve' | 'reject', reason?: string) {
    const status = action === 'approve' ? ContentStatus.APPROVED : ContentStatus.REJECTED;

    await this.prisma.$transaction([
      this.prisma.review.update({
        where: { id: reviewId },
        data: { status, moderationNote: reason },
      }),
      this.prisma.moderationLog.create({
        data: {
          moderatorId,
          contentType: 'review',
          contentId: reviewId,
          action,
          reason,
        },
      }),
    ]);

    return { message: 'عملیات با موفقیت انجام شد' };
  }

  async getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, role: true, trustLevel: true,
          trustScore: true, isActive: true, isBanned: true,
          createdAt: true, lastLoginAt: true,
          profile: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, meta: { total, page, limit } };
  }

  async banUser(moderatorId: string, userId: string, reason: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: true, banReason: reason },
    });
    return { message: 'کاربر مسدود شد' };
  }

  async verifyCompany(companyId: string) {
    await this.prisma.company.update({
      where: { id: companyId },
      data: { isVerified: true },
    });
    return { message: 'شرکت تأیید شد' };
  }

  async updateCompanyPlan(companyId: string, plan: string) {
    await this.prisma.company.update({
      where: { id: companyId },
      data: { plan: plan as any },
    });
    return { message: 'پلن شرکت به‌روز شد' };
  }

  async getModerationLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.moderationLog.findMany({
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.moderationLog.count(),
    ]);
    return { logs, meta: { total, page, limit } };
  }
}
