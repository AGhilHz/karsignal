import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { AiModerationService } from '../ai/ai-moderation.service';
import { ContentStatus } from '@prisma/client';

@Processor('moderation')
export class ModerationProcessor {
  private readonly logger = new Logger(ModerationProcessor.name);

  constructor(
    private prisma: PrismaService,
    private aiModeration: AiModerationService,
  ) {}

  @Process('moderate-review')
  async moderateReview(job: Job<{ reviewId: string; content: string }>) {
    const { reviewId, content } = job.data;
    this.logger.log(`Moderating review ${reviewId}`);

    try {
      const result = await this.aiModeration.moderateContent(content);

      let status: ContentStatus = ContentStatus.APPROVED;
      if (result.toxicityScore > 0.8 || result.spamScore > 0.8) {
        status = ContentStatus.REJECTED;
      } else if (result.toxicityScore > 0.5 || result.spamScore > 0.5) {
        status = ContentStatus.FLAGGED;
      }

      await this.prisma.review.update({
        where: { id: reviewId },
        data: {
          status,
          aiSpamScore: result.spamScore,
          aiToxicityScore: result.toxicityScore,
          qualityScore: result.qualityScore,
        },
      });

      // Update company aggregates if approved
      if (status === ContentStatus.APPROVED) {
        const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
        if (review) {
          // Trigger aggregate update (fire and forget)
          this.updateCompanyAggregates(review.companyId);
        }
      }

      this.logger.log(`Review ${reviewId} moderated: ${status}`);
    } catch (error) {
      this.logger.error(`Failed to moderate review ${reviewId}`, error);
      // Default to pending for manual review on AI failure
      await this.prisma.review.update({
        where: { id: reviewId },
        data: { status: ContentStatus.PENDING },
      });
    }
  }

  @Process('moderate-discussion')
  async moderateDiscussion(job: Job<{ discussionId: string; content: string }>) {
    const { discussionId, content } = job.data;

    try {
      const result = await this.aiModeration.moderateContent(content);
      let status: ContentStatus = ContentStatus.APPROVED;
      if (result.toxicityScore > 0.8) status = ContentStatus.REJECTED;
      else if (result.toxicityScore > 0.5) status = ContentStatus.FLAGGED;

      await this.prisma.discussion.update({
        where: { id: discussionId },
        data: { status, aiSpamScore: result.spamScore, aiToxicityScore: result.toxicityScore },
      });
    } catch (error) {
      this.logger.error(`Failed to moderate discussion ${discussionId}`, error);
    }
  }

  private async updateCompanyAggregates(companyId: string) {
    const result = await this.prisma.review.aggregate({
      where: { companyId, status: ContentStatus.APPROVED },
      _avg: {
        ratingOverall: true,
        ratingSalary: true,
        ratingManagement: true,
        ratingGrowth: true,
        ratingCulture: true,
        ratingWorkLife: true,
      },
      _count: { id: true },
    });

    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        overallRating: result._avg.ratingOverall,
        salaryScore: result._avg.ratingSalary,
        managementScore: result._avg.ratingManagement,
        growthScore: result._avg.ratingGrowth,
        cultureScore: result._avg.ratingCulture,
        workLifeScore: result._avg.ratingWorkLife,
        reviewCount: result._count.id,
      },
    });
  }
}
