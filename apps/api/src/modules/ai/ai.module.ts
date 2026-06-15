import { Module } from '@nestjs/common';
import { AiModerationService } from './ai-moderation.service';
import { AiController } from './ai.controller';

@Module({
  controllers: [AiController],
  providers: [AiModerationService],
  exports: [AiModerationService],
})
export class AiModule {}
