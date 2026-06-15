import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ModerationProcessor } from './moderation.processor';
import { AuthModule } from '../auth/auth.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'moderation' }),
    AuthModule,
    AiModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, ModerationProcessor],
  exports: [ReviewsService],
})
export class ReviewsModule {}
