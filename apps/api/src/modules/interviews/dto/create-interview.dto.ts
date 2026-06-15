import {
  IsString, IsOptional, IsEnum, IsBoolean, IsArray, IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InterviewDifficulty, InterviewResult } from '@prisma/client';

export class CreateInterviewDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty({ example: 'مهندس نرم‌افزار' })
  @IsString()
  position: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  interviewDate?: string;

  @ApiPropertyOptional({ enum: InterviewDifficulty })
  @IsOptional()
  @IsEnum(InterviewDifficulty)
  difficulty?: InterviewDifficulty;

  @ApiPropertyOptional({ enum: InterviewResult })
  @IsOptional()
  @IsEnum(InterviewResult)
  result?: InterviewResult;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  technicalQuestions?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  hrQuestions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tips?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  overallExperience?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  offerReceived?: boolean;
}
