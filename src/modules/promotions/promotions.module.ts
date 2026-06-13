import { CouponsModule } from './coupons/coupons.module';
import { FlashSalesModule } from './flash-sales/flash-sales.module';

import { Module } from '@nestjs/common';

@Module({
  imports: [CouponsModule, FlashSalesModule],
  exports: [CouponsModule, FlashSalesModule],
})
export class PromotionsModule {}
