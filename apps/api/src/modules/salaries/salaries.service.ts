import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { AnonymityService } from '../auth/anonymity.service';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class SalariesService {
  constructor(
    private prisma: PrismaService,
    private anonymity: AnonymityService,
    @InjectQueue('moderation') private moderationQueue: Queue,
  ) {}

  async submitReport(userId: string, dto: any) {
    const anonymousToken = await this.anonymity.getAnonymousToken(userId);

    const recentCount = await this.prisma.salaryReport.count({
      where: {
        anonymousAuthorToken: anonymousToken,
        reportYear: new Date().getFullYear(),
      },
    });
    if (recentCount >= 3) {
      throw new BadRequestException('حداکثر ۳ گزارش حقوق در سال مجاز است');
    }

    const report = await this.prisma.salaryReport.create({
      data: {
        ...dto,
        anonymousAuthorToken: anonymousToken,
        reportYear: dto.reportYear || new Date().getFullYear(),
        status: ContentStatus.PENDING,
      },
    });

    await this.moderationQueue.add('moderate-salary', {
      reportId: report.id,
      content: `${dto.position} ${dto.city || ''} ${dto.baseSalary}`,
    });

    return {
      id: report.id,
      message: 'گزارش حقوق با موفقیت ثبت شد و پس از بررسی منتشر خواهد شد',
    };
  }

  async getStats(filters: {
    position?: string;
    city?: string;
    industry?: string;
    companyId?: string;
    experienceLevel?: string;
  }) {
    const where: any = { status: ContentStatus.APPROVED };
    if (filters.position) where.position = { contains: filters.position, mode: 'insensitive' };
    if (filters.city) where.city = filters.city;
    if (filters.industry) where.industry = filters.industry;
    if (filters.companyId) where.companyId = filters.companyId;

    const reports = await this.prisma.salaryReport.findMany({
      where,
      select: { baseSalary: true, bonus: true, totalComp: true, reportYear: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    if (reports.length < 3) {
      return { message: 'داده کافی برای نمایش وجود ندارد', count: reports.length };
    }

    const salaries = reports.map(r => r.baseSalary).sort((a, b) => a - b);
    const n = salaries.length;

    return {
      count: n,
      median: salaries[Math.floor(n / 2)],
      average: Math.round(salaries.reduce((a, b) => a + b, 0) / n),
      min: salaries[0],
      max: salaries[n - 1],
      p25: salaries[Math.floor(n * 0.25)],
      p75: salaries[Math.floor(n * 0.75)],
      distribution: this.buildDistribution(salaries),
    };
  }

  async getTrends(position: string, city?: string) {
    const reports = await this.prisma.salaryReport.groupBy({
      by: ['reportYear'],
      where: {
        position: { contains: position, mode: 'insensitive' },
        status: ContentStatus.APPROVED,
        ...(city && { city }),
      },
      _avg: { baseSalary: true },
      _count: { id: true },
      orderBy: { reportYear: 'asc' },
    });

    return reports.map(r => ({
      year: r.reportYear,
      avgSalary: Math.round(r._avg.baseSalary || 0),
      count: r._count.id,
    }));
  }

  private buildDistribution(sortedSalaries: number[]) {
    const min = sortedSalaries[0];
    const max = sortedSalaries[sortedSalaries.length - 1];
    const bucketCount = 10;
    const bucketSize = (max - min) / bucketCount;

    const buckets = Array.from({ length: bucketCount }, (_, i) => ({
      min: Math.round(min + i * bucketSize),
      max: Math.round(min + (i + 1) * bucketSize),
      count: 0,
    }));

    for (const salary of sortedSalaries) {
      const idx = Math.min(Math.floor((salary - min) / bucketSize), bucketCount - 1);
      buckets[idx].count++;
    }

    return buckets;
  }
}
