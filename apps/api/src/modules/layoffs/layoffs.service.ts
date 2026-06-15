import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AnonymityService } from '../auth/anonymity.service';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class LayoffsService {
  constructor(
    private prisma: PrismaService,
    private anonymity: AnonymityService,
  ) {}

  async report(userId: string, dto: any) {
    const anonymousToken = await this.anonymity.getAnonymousToken(userId);
    return this.prisma.layoffReport.create({
      data: { ...dto, anonymousAuthorToken: anonymousToken, status: ContentStatus.PENDING },
    });
  }

  async getTrends() {
    // Aggregate only — never expose individual reports
    const reports = await this.prisma.layoffReport.groupBy({
      by: ['companyName'],
      where: { status: ContentStatus.APPROVED },
      _count: { id: true },
      _sum: { affectedCount: true },
      orderBy: { _count: { id: 'desc' } },
      take: 20,
    });

    return reports.map(r => ({
      company: r.companyName,
      reportCount: r._count.id,
      estimatedAffected: r._sum.affectedCount,
    }));
  }

  async getByCompany(companyId: string) {
    // Return only aggregate data, not individual reports
    const result = await this.prisma.layoffReport.aggregate({
      where: { companyId, status: ContentStatus.APPROVED },
      _count: { id: true },
      _sum: { affectedCount: true },
    });

    return {
      reportCount: result._count.id,
      estimatedAffected: result._sum.affectedCount,
    };
  }
}
