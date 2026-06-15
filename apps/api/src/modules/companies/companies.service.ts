import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('ai-reports') private aiQueue: Queue,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, dto: CreateCompanyDto) {
    const existing = await this.prisma.company.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('این نام شرکت قبلاً ثبت شده است');

    const company = await this.prisma.company.create({
      data: {
        ...dto,
        admins: { create: { userId, role: 'owner' } },
      },
    });

    this.eventEmitter.emit('company.created', company);
    return company;
  }

  async findBySlug(slug: string) {
    const company = await this.prisma.company.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { jobs: true, reviews: true, salaryReports: true, interviewExps: true },
        },
      },
    });
    if (!company) throw new NotFoundException('شرکت یافت نشد');
    return company;
  }

  async search(query: string, filters: any, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = { isActive: true };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }
    if (filters.industry) where.industry = filters.industry;
    if (filters.city) where.city = filters.city;
    if (filters.size) where.size = filters.size;

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ overallRating: 'desc' }, { reviewCount: 'desc' }],
        select: {
          id: true, name: true, slug: true, logoUrl: true,
          industry: true, city: true, size: true,
          overallRating: true, reviewCount: true, isVerified: true,
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return { companies, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getTopCompanies(industry?: string, limit = 10) {
    return this.prisma.company.findMany({
      where: {
        isActive: true,
        reviewCount: { gte: 5 },
        ...(industry && { industry }),
      },
      orderBy: { overallRating: 'desc' },
      take: limit,
      select: {
        id: true, name: true, slug: true, logoUrl: true,
        industry: true, city: true, overallRating: true,
        reviewCount: true, isVerified: true,
      },
    });
  }

  async update(userId: string, companyId: string, dto: UpdateCompanyDto) {
    const admin = await this.prisma.companyAdmin.findFirst({
      where: { userId, companyId },
    });
    if (!admin) throw new ForbiddenException('دسترسی غیرمجاز');

    return this.prisma.company.update({
      where: { id: companyId },
      data: dto,
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async scheduleAiReports() {
    const companies = await this.prisma.company.findMany({
      where: { isActive: true, reviewCount: { gte: 5 } },
      select: { id: true },
    });

    for (const company of companies) {
      await this.aiQueue.add('generate-company-report', { companyId: company.id }, {
        delay: Math.random() * 60000,
      });
    }

    this.logger.log(`Queued AI reports for ${companies.length} companies`);
  }
}
