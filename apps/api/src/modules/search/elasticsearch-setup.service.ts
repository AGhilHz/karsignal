import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class ElasticsearchSetupService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchSetupService.name);
  // Cast to any to avoid type issues with @nestjs/elasticsearch v10
  private readonly es: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor(elasticsearch: ElasticsearchService) {
    this.es = elasticsearch;
  }

  async onModuleInit() {
    try {
      await this.createIndices();
    } catch (_error) {
      this.logger.warn('Elasticsearch not available — skipping index setup');
    }
  }

  private async createIndices() {
    await this.createJobsIndex();
    await this.createCompaniesIndex();
  }

  private async createJobsIndex() {
    try {
      const exists = await this.es.indices.exists({ index: 'jobs' });
      if (exists) return;

      await this.es.indices.create({
        index: 'jobs',
        mappings: {
          properties: {
            title:          { type: 'text' },
            description:    { type: 'text' },
            city:           { type: 'keyword' },
            isRemote:       { type: 'boolean' },
            employmentType: { type: 'keyword' },
            industry:       { type: 'keyword' },
            status:         { type: 'keyword' },
            companyName:    { type: 'text' },
            skills:         { type: 'keyword' },
            createdAt:      { type: 'date' },
          },
        },
      });
      this.logger.log('Jobs index created');
    } catch (_error) {
      this.logger.warn('Could not create jobs index');
    }
  }

  private async createCompaniesIndex() {
    try {
      const exists = await this.es.indices.exists({ index: 'companies' });
      if (exists) return;

      await this.es.indices.create({
        index: 'companies',
        mappings: {
          properties: {
            name:          { type: 'text' },
            description:   { type: 'text' },
            industry:      { type: 'keyword' },
            city:          { type: 'keyword' },
            overallRating: { type: 'float' },
            reviewCount:   { type: 'integer' },
            isVerified:    { type: 'boolean' },
          },
        },
      });
      this.logger.log('Companies index created');
    } catch (_error) {
      this.logger.warn('Could not create companies index');
    }
  }
}
