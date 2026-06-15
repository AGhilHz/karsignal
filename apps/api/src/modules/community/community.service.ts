import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { AnonymityService } from '../auth/anonymity.service';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class CommunityService {
  constructor(
    private prisma: PrismaService,
    private anonymity: AnonymityService,
    @InjectQueue('moderation') private moderationQueue: Queue,
  ) {}

  async createDiscussion(userId: string, dto: any) {
    const anonymousToken = await this.anonymity.getAnonymousToken(userId);
    const displayName = this.anonymity.generateDisplayName(dto.position, dto.city);

    const discussion = await this.prisma.discussion.create({
      data: {
        topicId: dto.topicId,
        companyId: dto.companyId,
        anonymousAuthorToken: anonymousToken,
        title: dto.title,
        body: dto.body,
        isAnonymous: dto.isAnonymous !== false,
        authorDisplayName: displayName,
        status: ContentStatus.APPROVED,
      },
    });

    await this.moderationQueue.add('moderate-discussion', {
      discussionId: discussion.id,
      content: `${dto.title} ${dto.body}`,
    });

    return discussion;
  }

  async getDiscussions(filters: any, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = { status: ContentStatus.APPROVED };
    if (filters.topicId) where.topicId = filters.topicId;
    if (filters.companyId) where.companyId = filters.companyId;

    const [discussions, total] = await Promise.all([
      this.prisma.discussion.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          topic: { select: { name: true, slug: true } },
          company: { select: { name: true, slug: true, logoUrl: true } },
          _count: { select: { comments: true } },
        },
        // NEVER select anonymousAuthorToken
      }),
      this.prisma.discussion.count({ where }),
    ]);

    return { discussions, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async addComment(userId: string, discussionId: string, body: string, parentId?: string) {
    const discussion = await this.prisma.discussion.findUnique({ where: { id: discussionId } });
    if (!discussion) throw new NotFoundException('بحث یافت نشد');

    const anonymousToken = await this.anonymity.getAnonymousToken(userId);

    const comment = await this.prisma.comment.create({
      data: {
        discussionId,
        parentId,
        anonymousAuthorToken: anonymousToken,
        body,
        isAnonymous: true,
        status: ContentStatus.APPROVED,
      },
    });

    await this.prisma.discussion.update({
      where: { id: discussionId },
      data: { commentCount: { increment: 1 } },
    });

    return comment;
  }

  async vote(userId: string, discussionId: string, value: 1 | -1) {
    await this.prisma.discussionVote.upsert({
      where: { discussionId_userId: { discussionId, userId } },
      create: { discussionId, userId, value },
      update: { value },
    });

    const [up, down] = await Promise.all([
      this.prisma.discussionVote.count({ where: { discussionId, value: 1 } }),
      this.prisma.discussionVote.count({ where: { discussionId, value: -1 } }),
    ]);

    await this.prisma.discussion.update({
      where: { id: discussionId },
      data: { upvotes: up, downvotes: down },
    });

    return { message: 'رأی ثبت شد' };
  }

  async getTopics() {
    return this.prisma.topic.findMany({ orderBy: { postCount: 'desc' } });
  }
}
