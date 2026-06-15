import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { AiModerationService } from './ai-moderation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

class SearchDto {
  @IsString()
  query: string;
}

class SalaryPredictDto {
  @IsString() position: string;
  @IsString() city: string;
  experienceYears: number;
  skills: string[];
  industry?: string;
}

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private aiService: AiModerationService) {}

  @Post('search')
  @ApiOperation({ summary: 'Natural language job search' })
  async search(@Body() dto: SearchDto) {
    return this.aiService.naturalLanguageSearch(dto.query);
  }

  @Post('salary-predict')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI salary prediction' })
  async predictSalary(@Body() dto: SalaryPredictDto) {
    return this.aiService.predictSalary(dto);
  }
}
