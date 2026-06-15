import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LayoffsService } from './layoffs.service';
import { CreateLayoffDto } from './dto/create-layoff.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TrustLevelGuard } from '../../common/guards/trust-level.guard';
import { RequireTrustLevel } from '../../common/decorators/trust-level.decorator';
import { TrustLevel } from '@prisma/client';

@ApiTags('layoffs')
@Controller('layoffs')
export class LayoffsController {
  constructor(private layoffsService: LayoffsService) {}

  @Post('report')
  @UseGuards(JwtAuthGuard, TrustLevelGuard)
  @RequireTrustLevel(TrustLevel.LEVEL_1_PHONE_VERIFIED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report a layoff anonymously' })
  async report(@Request() req: any, @Body() dto: CreateLayoffDto) {
    return this.layoffsService.report(req.user.id, dto);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get layoff trends (aggregate data only — no individual records)' })
  async getTrends() {
    return this.layoffsService.getTrends();
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get layoff aggregate data for a company' })
  async getByCompany(@Param('companyId') companyId: string) {
    return this.layoffsService.getByCompany(companyId);
  }
}
