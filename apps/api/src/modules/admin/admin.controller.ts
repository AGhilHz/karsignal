import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MODERATOR)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('reviews/pending')
  @ApiOperation({ summary: 'Get pending reviews for moderation' })
  async getPendingReviews(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getPendingReviews(+page, +limit);
  }

  @Patch('reviews/:id/moderate')
  @ApiOperation({ summary: 'Approve or reject a review' })
  async moderateReview(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: { action: 'approve' | 'reject'; reason?: string },
  ) {
    return this.adminService.moderateReview(req.user.id, id, dto.action, dto.reason);
  }

  @Get('users')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  async getUsers(@Query('page') page = 1, @Query('limit') limit = 20, @Query('search') search: string) {
    return this.adminService.getUsers(+page, +limit, search);
  }

  @Post('users/:id/ban')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Ban a user' })
  async banUser(@Param('id') id: string, @Request() req: any, @Body() dto: { reason: string }) {
    return this.adminService.banUser(req.user.id, id, dto.reason);
  }

  @Post('companies/:id/verify')
  @ApiOperation({ summary: 'Verify a company' })
  async verifyCompany(@Param('id') id: string) {
    return this.adminService.verifyCompany(id);
  }

  @Patch('companies/:id/plan')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update company plan' })
  async updateCompanyPlan(
    @Param('id') id: string,
    @Body() dto: { plan: string },
  ) {
    return this.adminService.updateCompanyPlan(id, dto.plan);
  }

  @Get('moderation-logs')
  @ApiOperation({ summary: 'Get moderation logs' })
  async getModerationLogs(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.adminService.getModerationLogs(+page, +limit);
  }
}
