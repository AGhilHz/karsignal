import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { AiModerationService } from '../ai/ai-moderation.service';
import { ContentStatus } from '@prisma/client';

@Processor('ai-reports')
export class AiReportProcessor {
  private readonly logger = new Logger(AiReportProcessor.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiModerationService,
  ) {}

  @Process('generate-company-report')
  async generateReport(job: Job<{ companyId: string }>) {
    const { companyId } = job.data;

    const reviews = await this.prisma.review.findMany({
      where: { companyId, status: ContentStatus.APPROVED },
      select: { pros: true, cons: true, ratingOverall: true, ratingManagement: true },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    if (reviews.length < 3) return;

    try {
      const report = await this.aiService.generateCompanyReport(companyId, reviews);

      await this.prisma.company.update({
        where: { id: companyId },
        data: {
          aiStrengths: report.strengths,
          aiComplaints: report.complaints,
          aiCultureSummary: report.cultureSummary,
          aiRiskScore: report.riskScore,
          aiLastUpdated: new Date(),
        },
      });

      this.logger.log(`AI report generated for company ${companyId}`);
    } catch (error) {
      this.logger.error(`Failed to generate AI report for ${companyId}`, error);
    }
  }
}
