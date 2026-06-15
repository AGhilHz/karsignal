import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SalariesService } from './salaries.service';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TrustLevelGuard } from '../../common/guards/trust-level.guard';
import { RequireTrustLevel } from '../../common/decorators/trust-level.decorator';
import { TrustLevel } from '@prisma/client';

@ApiTags('salaries')
@Controller('salaries')
export class SalariesController {
  constructor(private salariesService: SalariesService) {}

  @Post('report')
  @UseGuards(JwtAuthGuard, TrustLevelGuard)
  @RequireTrustLevel(TrustLevel.LEVEL_1_PHONE_VERIFIED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit an anonymous salary report' })
  async submit(@Request() req: any, @Body() dto: CreateSalaryDto) {
    return this.salariesService.submitReport(req.user.id, dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get salary statistics' })
  async getStats(
    @Query('position') position: string,
    @Query('city') city: string,
    @Query('industry') industry: string,
    @Query('companyId') companyId: string,
    @Query('experienceLevel') experienceLevel: string,
  ) {
    return this.salariesService.getStats({ position, city, industry, companyId, experienceLevel });
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get salary trends over time' })
  async getTrends(
    @Query('position') position: string,
    @Query('city') city: string,
  ) {
    return this.salariesService.getTrends(position, city);
  }
}
