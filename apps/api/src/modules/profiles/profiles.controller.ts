import {
  Controller, Get, Put, Post, Delete,
  Body, Param, UseGuards, Request, Res, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ProfilesService } from './profiles.service';
import { PdfExportService } from './pdf-export.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(
    private profilesService: ProfilesService,
    private pdfExportService: PdfExportService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my profile' })
  async getMyProfile(@Request() req: any) {
    return this.profilesService.getMyProfile(req.user.id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my profile' })
  async updateProfile(@Request() req: any, @Body() dto: any) {
    return this.profilesService.updateProfile(req.user.id, dto);
  }

  @Post('me/work-experience')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add work experience' })
  async addWorkExperience(@Request() req: any, @Body() dto: any) {
    return this.profilesService.addWorkExperience(req.user.id, dto);
  }

  @Delete('me/work-experience/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete work experience' })
  async deleteWorkExperience(@Request() req: any, @Param('id') id: string) {
    return this.profilesService.deleteWorkExperience(req.user.id, id);
  }

  @Post('me/education')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add education' })
  async addEducation(@Request() req: any, @Body() dto: any) {
    return this.profilesService.addEducation(req.user.id, dto);
  }

  @Delete('me/education/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete education' })
  async deleteEducation(@Request() req: any, @Param('id') id: string) {
    return this.profilesService.deleteEducation(req.user.id, id);
  }

  @Post('me/skills')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add skill' })
  async addSkill(@Request() req: any, @Body() dto: { skillId: string; level?: number }) {
    return this.profilesService.addSkill(req.user.id, dto);
  }

  @Delete('me/skills/:skillId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove skill' })
  async removeSkill(@Request() req: any, @Param('skillId') skillId: string) {
    return this.profilesService.removeSkill(req.user.id, skillId);
  }

  @Get('me/export/pdf')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export resume as PDF' })
  async exportPdf(@Request() req: any, @Res() res: Response) {
    const buffer = await this.pdfExportService.generateResumePdf(req.user.id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="resume.pdf"',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get public profile by slug' })
  async getPublicProfile(@Param('slug') slug: string) {
    return this.profilesService.getPublicProfile(slug);
  }
}
