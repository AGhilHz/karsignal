import {
  IsString, IsOptional, IsBoolean, IsInt, IsUrl,
  IsEnum, IsDateString, Min, Max,
} from 'class-validator';
import { EmploymentType } from '@prisma/client';

export class UpdateProfileDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() headline?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsUrl() website?: string;
  @IsOptional() @IsUrl() linkedinUrl?: string;
  @IsOptional() @IsUrl() githubUrl?: string;
  @IsOptional() @IsBoolean() isPublic?: boolean;
  @IsOptional() @IsString() publicSlug?: string;
}

export class AddWorkExperienceDto {
  @IsOptional() @IsString() companyId?: string;
  @IsString() companyName: string;
  @IsString() title: string;
  @IsOptional() @IsString() department?: string;
  @IsOptional() @IsEnum(EmploymentType) employmentType?: EmploymentType;
  @IsOptional() @IsString() city?: string;
  @IsDateString() startDate: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsBoolean() isCurrent?: boolean;
  @IsOptional() @IsString() description?: string;
}

export class AddEducationDto {
  @IsString() institution: string;
  @IsOptional() @IsString() degree?: string;
  @IsOptional() @IsString() fieldOfStudy?: string;
  @IsDateString() startDate: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsBoolean() isCurrent?: boolean;
  @IsOptional() @IsString() grade?: string;
  @IsOptional() @IsString() description?: string;
}

export class AddSkillDto {
  @IsString() skillId: string;
  @IsOptional() @IsInt() @Min(1) @Max(5) level?: number;
}
