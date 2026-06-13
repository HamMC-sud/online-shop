import { SubOrdersModule } from './sub-orders/sub-orders.module';
import { InvoicesModule } from './invoices/invoices.module';
import { StatusHistoryModule } from './status-history/status-history.module';

import { Module } from '@nestjs/common';

@Module({
  imports: [SubOrdersModule, InvoicesModule, StatusHistoryModule],
  exports: [SubOrdersModule, InvoicesModule, StatusHistoryModule],
})
export class OrdersModule {}
