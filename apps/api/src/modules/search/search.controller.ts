import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Natural language search across jobs and companies' })
  async search(@Query('q') q: string) {
    return this.searchService.naturalLanguageSearch(q);
  }
}
