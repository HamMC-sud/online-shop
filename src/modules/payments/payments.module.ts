import { TransactionsModule } from './transactions/transactions.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { RefundsModule } from './refunds/refunds.module';

import { Module } from '@nestjs/common';

@Module({
  imports: [TransactionsModule, WebhooksModule, RefundsModule],
  exports: [TransactionsModule, WebhooksModule, RefundsModule],
})
export class PaymentsModule {}
