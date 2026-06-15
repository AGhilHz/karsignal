import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

class ApplyDto {
  @IsOptional() @IsString() coverLetter?: string;
  @IsOptional() @IsString() resumeUrl?: string;
}

class UpdateStatusDto {
  @IsEnum(ApplicationStatus) status: ApplicationStatus;
  @IsOptional() @IsString() note?: string;
}

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post a new job' })
  async create(@Request() req: any, @Body() dto: CreateJobDto) {
    return this.jobsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Search jobs' })
  async search(
    @Query('q') q: string,
    @Query('city') city: string,
    @Query('employmentType') employmentType: string,
    @Query('isRemote') isRemote: boolean,
    @Query('industry') industry: string,
    @Query('companyId') companyId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.jobsService.search({ q, city, employmentType, isRemote, industry, companyId }, +page, +limit);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get job details' })
  async findOne(@Param('slug') slug: string) {
    return this.jobsService.findBySlug(slug);
  }

  @Post(':id/apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply to a job' })
  async apply(@Param('id') id: string, @Request() req: any, @Body() dto: ApplyDto) {
    return this.jobsService.apply(req.user.id, id, dto.coverLetter, dto.resumeUrl);
  }

  @Get('applications/company/:companyId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get applications for a company' })
  async getApplications(
    @Param('companyId') companyId: string,
    @Request() req: any,
    @Query('jobId') jobId?: string,
  ) {
    return this.jobsService.getApplications(req.user.id, companyId, jobId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a job posting' })
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobsService.update(req.user.id, id, dto);
  }

  @Patch('applications/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update application status' })
  async updateStatus(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.jobsService.updateApplicationStatus(req.user.id, id, dto.status, dto.note);
  }
}
