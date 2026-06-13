import { Module } from '@nestjs/common';
import { StatusHistoryController } from './status-history.controller';
import { StatusHistoryService } from './status-history.service';

@Module({
  controllers: [StatusHistoryController],
  providers: [StatusHistoryService],
  exports: [StatusHistoryService],
})
export class StatusHistoryModule {}
