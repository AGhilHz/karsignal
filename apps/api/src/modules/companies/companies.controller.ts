import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a company page' })
  async create(@Request() req: any, @Body() dto: CreateCompanyDto) {
    return this.companiesService.create(req.user.id, dto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search companies' })
  async search(
    @Query('q') q: string,
    @Query('industry') industry: string,
    @Query('city') city: string,
    @Query('size') size: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.companiesService.search(q, { industry, city, size }, +page, +limit);
  }

  @Get('top')
  @ApiOperation({ summary: 'Get top rated companies' })
  async getTop(@Query('industry') industry: string, @Query('limit') limit = 10) {
    return this.companiesService.getTopCompanies(industry, +limit);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get company by slug' })
  async findOne(@Param('slug') slug: string) {
    return this.companiesService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update company info (company admin only)' })
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(req.user.id, id, dto);
  }
}
