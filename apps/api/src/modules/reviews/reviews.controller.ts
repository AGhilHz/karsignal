import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TrustLevelGuard } from '../../common/guards/trust-level.guard';
import { RequireTrustLevel } from '../../common/decorators/trust-level.decorator';
import { TrustLevel } from '@prisma/client';
import { IsBoolean } from 'class-validator';

class VoteDto {
  @IsBoolean()
  isHelpful: boolean;
}

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, TrustLevelGuard)
  @RequireTrustLevel(TrustLevel.LEVEL_1_PHONE_VERIFIED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit an anonymous workplace review' })
  async create(@Request() req: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(req.user.id, dto);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get most recent approved reviews across all companies' })
  async findRecent(@Query('limit') limit = 10) {
    return this.reviewsService.findRecent(+limit);
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get approved reviews for a company' })
  async findByCompany(
    @Param('companyId') companyId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.reviewsService.findByCompany(companyId, +page, +limit);
  }

  @Get('company/:companyId/summary')
  @ApiOperation({ summary: 'Get rating summary for a company' })
  async getSummary(@Param('companyId') companyId: string) {
    return this.reviewsService.getCompanyRatingSummary(companyId);
  }

  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vote review as helpful or not helpful' })
  async vote(@Param('id') id: string, @Request() req: any, @Body() dto: VoteDto) {
    return this.reviewsService.voteHelpful(id, req.user.id, dto.isHelpful);
  }
}
