import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TrustLevel } from '@prisma/client';

interface TrustFactors {
  phoneVerified: boolean;
  emailVerified: boolean;
  identityVerified: boolean;
  employmentVerified: boolean;
  resumeCompleteness: number; // 0-100
  reviewCount: number;
  helpfulVotes: number;
  reportCount: number; // negative factor
}

@Injectable()
export class TrustService {
  private readonly logger = new Logger(TrustService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Recalculate and persist trust score for a user.
   * Called after any verification event.
   */
  async recalculateTrustScore(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            workExperiences: true,
            educations: true,
            skills: true,
            certifications: true,
          },
        },
        verifications: { where: { verifiedAt: { not: null } } },
      },
    });

    if (!user) return 0;

    const factors = await this.gatherFactors(user);
    const score = this.calculateScore(factors);
    const trustLevel = this.determineTrustLevel(user, factors);

    await this.prisma.user.update({
      where: { id: userId },
      data: { trustScore: score, trustLevel },
    });

    this.logger.log(`Trust score updated for user ${userId}: ${score} (${trustLevel})`);
    return score;
  }

  private async gatherFactors(user: any): Promise<TrustFactors> {
    const verificationTypes = user.verifications.map((v: any) => v.type);

    // Count helpful votes on reviews
    const helpfulVotes = await this.prisma.review.aggregate({
      where: { anonymousAuthorToken: user.anonymousTokenHash },
      _sum: { isHelpful: true },
    });

    return {
      phoneVerified: !!user.phoneVerifiedAt,
      emailVerified: !!user.emailVerifiedAt,
      identityVerified: verificationTypes.includes('identity'),
      employmentVerified: verificationTypes.includes('employment'),
      resumeCompleteness: this.calculateResumeCompleteness(user.profile),
      reviewCount: 0, // would query reviews table
      helpfulVotes: helpfulVotes._sum.isHelpful || 0,
      reportCount: 0, // would query moderation logs
    };
  }

  private calculateScore(factors: TrustFactors): number {
    let score = 0;

    // Base verifications (max 60 points)
    if (factors.emailVerified) score += 10;
    if (factors.phoneVerified) score += 20;
    if (factors.identityVerified) score += 15;
    if (factors.employmentVerified) score += 15;

    // Profile completeness (max 20 points)
    score += Math.floor((factors.resumeCompleteness / 100) * 20);

    // Community reputation (max 20 points)
    const helpfulScore = Math.min(factors.helpfulVotes * 2, 15);
    score += helpfulScore;

    // Negative factors
    score -= Math.min(factors.reportCount * 5, 20);

    return Math.max(0, Math.min(100, score));
  }

  private determineTrustLevel(user: any, factors: TrustFactors): TrustLevel {
    if (factors.employmentVerified) return TrustLevel.LEVEL_3_EMPLOYMENT_VERIFIED;
    if (factors.identityVerified) return TrustLevel.LEVEL_2_IDENTITY_VERIFIED;
    if (factors.phoneVerified) return TrustLevel.LEVEL_1_PHONE_VERIFIED;
    return TrustLevel.LEVEL_0_UNVERIFIED;
  }

  private calculateResumeCompleteness(profile: any): number {
    if (!profile) return 0;
    let score = 0;
    const checks = [
      profile.firstName && profile.lastName,   // 10
      profile.headline,                          // 10
      profile.bio,                               // 10
      profile.avatarUrl,                         // 10
      profile.city,                              // 5
      profile.workExperiences?.length > 0,       // 20
      profile.educations?.length > 0,            // 15
      profile.skills?.length >= 3,               // 10
      profile.certifications?.length > 0,        // 5
      profile.website || profile.linkedinUrl,    // 5
    ];
    const weights = [10, 10, 10, 10, 5, 20, 15, 10, 5, 5];
    checks.forEach((check, i) => { if (check) score += weights[i]; });
    return score;
  }
}
