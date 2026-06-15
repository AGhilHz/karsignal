import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { AiModerationService } from '../ai/ai-moderation.service';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly es: any;

  constructor(
    elasticsearch: ElasticsearchService,
    private readonly aiService: AiModerationService,
  ) {
    this.es = elasticsearch;
  }

  async naturalLanguageSearch(query: string) {
    const parsed = await this.aiService.naturalLanguageSearch(query);

    const esQuery: any = {
      bool: {
        must: parsed.keywords.length > 0
          ? [{ multi_match: { query: parsed.keywords.join(' '), fields: ['title^3', 'description', 'company.name^2'] } }]
          : [{ match_all: {} }],
        filter: [] as any[],
      },
    };

    if (parsed.filters.city) {
      esQuery.bool.filter.push({ term: { city: parsed.filters.city } });
    }
    if (parsed.filters.isRemote) {
      esQuery.bool.filter.push({ term: { isRemote: true } });
    }

    const index = parsed.intent === 'companies' ? 'companies' : 'jobs';

    try {
      const result = await this.es.search({ index, query: esQuery, size: 20 });
      return {
        intent: parsed.intent,
        results: result.hits.hits.map((h: any) => ({ id: h._id, ...h._source, score: h._score })),
        total: result.hits.total?.value ?? 0,
      };
    } catch (error) {
      this.logger.error('Elasticsearch search failed', error);
      return { intent: parsed.intent, results: [], total: 0 };
    }
  }

  @OnEvent('job.created')
  async handleJobCreated(job: any) {
    await this.indexJob(job);
  }

  @OnEvent('job.updated')
  async handleJobUpdated(job: any) {
    await this.indexJob(job);
  }

  @OnEvent('company.created')
  async handleCompanyCreated(company: any) {
    await this.indexCompany(company);
  }

  @OnEvent('company.updated')
  async handleCompanyUpdated(company: any) {
    await this.indexCompany(company);
  }

  async indexJob(job: any) {
    try {
      await this.es.index({ index: 'jobs', id: job.id, document: job });
    } catch (error) {
      this.logger.error('Failed to index job', error);
    }
  }

  async indexCompany(company: any) {
    try {
      await this.es.index({ index: 'companies', id: company.id, document: company });
    } catch (error) {
      this.logger.error('Failed to index company', error);
    }
  }
}
