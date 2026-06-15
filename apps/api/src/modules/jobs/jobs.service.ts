import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, dto: CreateJobDto) {
    // Verify user is company admin
    const admin = await this.prisma.companyAdmin.findFirst({
      where: { userId, companyId: dto.companyId },
    });
    if (!admin) throw new ForbiddenException('شما مدیر این شرکت نیستید');

    const slug = `${dto.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const job = await this.prisma.job.create({
      data: { ...dto, slug },
    });

    // Emit event to index in Elasticsearch
    this.eventEmitter.emit('job.created', job);

    return job;
  }

  async search(filters: any, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = { status: 'ACTIVE' };

    if (filters.q) {
      where.OR = [
        { title: { contains: filters.q, mode: 'insensitive' } },
        { description: { contains: filters.q, mode: 'insensitive' } },
      ];
    }
    if (filters.city) where.city = filters.city;
    if (filters.employmentType) where.employmentType = filters.employmentType;
    if (filters.isRemote) where.isRemote = true;
    if (filters.industry) where.industry = filters.industry;
    if (filters.companyId) where.companyId = filters.companyId;

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { isHighlighted: 'desc' }, { createdAt: 'desc' }],
        include: {
          company: {
            select: { id: true, name: true, slug: true, logoUrl: true, isVerified: true },
          },
          skills: { include: { skill: true } },
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    return { jobs, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findBySlug(slug: string) {
    const job = await this.prisma.job.findUnique({
      where: { slug },
      include: {
        company: true,
        skills: { include: { skill: true } },
      },
    });
    if (!job) throw new NotFoundException('آگهی یافت نشد');

    // Increment view count
    await this.prisma.job.update({ where: { slug }, data: { viewCount: { increment: 1 } } });

    return job;
  }

  async apply(userId: string, jobId: string, coverLetter?: string, resumeUrl?: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'ACTIVE') throw new NotFoundException('آگهی یافت نشد یا منقضی شده');

    const existing = await this.prisma.application.findUnique({
      where: { jobId_userId: { jobId, userId } },
    });
    if (existing) throw new ForbiddenException('قبلاً برای این آگهی درخواست داده‌اید');

    const application = await this.prisma.application.create({
      data: {
        jobId,
        userId,
        coverLetter,
        resumeUrl,
        status: ApplicationStatus.APPLIED,
        pipelineStages: {
          create: { stage: ApplicationStatus.APPLIED },
        },
      },
    });

    await this.prisma.job.update({ where: { id: jobId }, data: { applyCount: { increment: 1 } } });

    return application;
  }

  async getApplications(userId: string, companyId: string, jobId?: string) {
    // Verify user is company admin
    const admin = await this.prisma.companyAdmin.findFirst({ where: { userId, companyId } });
    if (!admin) throw new ForbiddenException();

    return this.prisma.application.findMany({
      where: { job: { companyId, ...(jobId && { id: jobId }) } },
      include: {
        job: { select: { title: true } },
        pipelineStages: { orderBy: { changedAt: 'desc' } },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async updateApplicationStatus(
    recruiterId: string,
    applicationId: string,
    status: ApplicationStatus,
    note?: string,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });
    if (!application) throw new NotFoundException();

    const admin = await this.prisma.companyAdmin.findFirst({
      where: { userId: recruiterId, companyId: application.job.companyId },
    });
    if (!admin) throw new ForbiddenException();

    await this.prisma.$transaction([
      this.prisma.application.update({
        where: { id: applicationId },
        data: { status, recruiterNote: note },
      }),
      this.prisma.pipelineStage.create({
        data: { applicationId, stage: status, note, changedBy: recruiterId },
      }),
    ]);

    return { message: 'وضعیت درخواست به‌روز شد' };
  }

  async update(userId: string, jobId: string, dto: any) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('آگهی یافت نشد');

    const admin = await this.prisma.companyAdmin.findFirst({
      where: { userId, companyId: job.companyId },
    });
    if (!admin) throw new ForbiddenException('دسترسی غیرمجاز');

    return this.prisma.job.update({ where: { id: jobId }, data: dto });
  }
}
