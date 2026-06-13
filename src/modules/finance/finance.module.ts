import { SellerBalancesModule } from './seller-balances/seller-balances.module';
import { CommissionsModule } from './commissions/commissions.module';

import { Module } from '@nestjs/common';

@Module({
  imports: [SellerBalancesModule, CommissionsModule],
  exports: [SellerBalancesModule, CommissionsModule],
})
export class FinanceModule {}
