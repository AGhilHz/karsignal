import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AnonymityService } from '../auth/anonymity.service';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class InterviewsService {
  constructor(
    private prisma: PrismaService,
    private anonymity: AnonymityService,
  ) {}

  async submit(userId: string, dto: any) {
    const anonymousToken = await this.anonymity.getAnonymousToken(userId);
    return this.prisma.interviewExperience.create({
      data: { ...dto, anonymousAuthorToken: anonymousToken, status: ContentStatus.PENDING },
    });
  }

  async findByCompany(companyId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [interviews, total] = await Promise.all([
      this.prisma.interviewExperience.findMany({
        where: { companyId, status: ContentStatus.APPROVED },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, position: true, difficulty: true, result: true,
          duration: true, stages: true, technicalQuestions: true,
          hrQuestions: true, tips: true, overallExperience: true,
          offerReceived: true, interviewDate: true, createdAt: true,
        },
      }),
      this.prisma.interviewExperience.count({ where: { companyId, status: ContentStatus.APPROVED } }),
    ]);
    return { interviews, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getPreparationGuide(companyId: string, position: string) {
    const interviews = await this.prisma.interviewExperience.findMany({
      where: {
        companyId,
        position: { contains: position, mode: 'insensitive' },
        status: ContentStatus.APPROVED,
      },
      select: { technicalQuestions: true, hrQuestions: true, tips: true, difficulty: true },
      take: 20,
    });

    const allTechnical = [...new Set(interviews.flatMap(i => i.technicalQuestions))];
    const allHr = [...new Set(interviews.flatMap(i => i.hrQuestions))];
    const allTips = interviews.map(i => i.tips).filter(Boolean);

    return { technicalQuestions: allTechnical, hrQuestions: allHr, tips: allTips };
  }
}
