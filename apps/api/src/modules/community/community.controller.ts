import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { CreateDiscussionDto, CreateCommentDto } from './dto/create-discussion.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TrustLevelGuard } from '../../common/guards/trust-level.guard';
import { RequireTrustLevel } from '../../common/decorators/trust-level.decorator';
import { TrustLevel } from '@prisma/client';

@ApiTags('community')
@Controller('community')
export class CommunityController {
  constructor(private communityService: CommunityService) {}

  @Get('topics')
  @ApiOperation({ summary: 'Get all discussion topics' })
  async getTopics() {
    return this.communityService.getTopics();
  }

  @Get('discussions')
  @ApiOperation({ summary: 'Get discussions with optional filters' })
  async getDiscussions(
    @Query('topicId') topicId: string,
    @Query('companyId') companyId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.communityService.getDiscussions({ topicId, companyId }, +page, +limit);
  }

  @Post('discussions')
  @UseGuards(JwtAuthGuard, TrustLevelGuard)
  @RequireTrustLevel(TrustLevel.LEVEL_1_PHONE_VERIFIED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an anonymous discussion' })
  async createDiscussion(@Request() req: any, @Body() dto: CreateDiscussionDto) {
    return this.communityService.createDiscussion(req.user.id, dto);
  }

  @Post('discussions/:id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a comment to a discussion' })
  async addComment(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: CreateCommentDto,
  ) {
    return this.communityService.addComment(req.user.id, id, dto.body, dto.parentId);
  }

  @Post('discussions/:id/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vote on a discussion (1 = upvote, -1 = downvote)' })
  async vote(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: { value: 1 | -1 },
  ) {
    return this.communityService.vote(req.user.id, id, dto.value);
  }
}
