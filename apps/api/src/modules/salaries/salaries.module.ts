import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SalariesController } from './salaries.controller';
import { SalariesService } from './salaries.service';
import { AuthModule } from '../auth/auth.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    AuthModule,
    AiModule,
    BullModule.registerQueue({ name: 'moderation' }),
  ],
  controllers: [SalariesController],
  providers: [SalariesService],
  exports: [SalariesService],
})
export class SalariesModule {}
