import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { ElasticsearchSetupService } from './elasticsearch-setup.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    AiModule,
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        node: config.get('ELASTICSEARCH_NODE', 'http://localhost:9200'),
      }),
    }),
  ],
  controllers: [SearchController],
  providers: [SearchService, ElasticsearchSetupService],
  exports: [SearchService],
})
export class SearchModule {}
