import { Module } from '@nestjs/common';
import { LayoffsController } from './layoffs.controller';
import { LayoffsService } from './layoffs.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [LayoffsController],
  providers: [LayoffsService],
  exports: [LayoffsService],
})
export class LayoffsModule {}
