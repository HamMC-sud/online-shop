import { Module } from '@nestjs/common';
import { SubOrdersController } from './sub-orders.controller';
import { SubOrdersService } from './sub-orders.service';

@Module({
  controllers: [SubOrdersController],
  providers: [SubOrdersService],
  exports: [SubOrdersService],
})
export class SubOrdersModule {}
