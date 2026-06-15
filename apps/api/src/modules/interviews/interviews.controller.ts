import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TrustLevelGuard } from '../../common/guards/trust-level.guard';
import { RequireTrustLevel } from '../../common/decorators/trust-level.decorator';
import { TrustLevel } from '@prisma/client';

@ApiTags('interviews')
@Controller('interviews')
export class InterviewsController {
  constructor(private interviewsService: InterviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, TrustLevelGuard)
  @RequireTrustLevel(TrustLevel.LEVEL_1_PHONE_VERIFIED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit an anonymous interview experience' })
  async submit(@Request() req: any, @Body() dto: CreateInterviewDto) {
    return this.interviewsService.submit(req.user.id, dto);
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get interview experiences for a company' })
  async findByCompany(
    @Param('companyId') companyId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.interviewsService.findByCompany(companyId, +page, +limit);
  }

  @Get('company/:companyId/prep')
  @ApiOperation({ summary: 'Get interview preparation guide for a position' })
  async getPrep(
    @Param('companyId') companyId: string,
    @Query('position') position: string,
  ) {
    return this.interviewsService.getPreparationGuide(companyId, position);
  }
}
