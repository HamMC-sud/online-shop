import { Module } from '@nestjs/common';
import { ViewsHistoryController } from './views-history.controller';
import { ViewsHistoryService } from './views-history.service';

@Module({
  controllers: [ViewsHistoryController],
  providers: [ViewsHistoryService],
  exports: [ViewsHistoryService],
})
export class ViewsHistoryModule {}
