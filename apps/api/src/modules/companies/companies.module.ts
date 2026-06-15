import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { AiReportProcessor } from './ai-report.processor';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'ai-reports' }),
    AiModule,
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService, AiReportProcessor],
  exports: [CompaniesService],
})
export class CompaniesModule {}
