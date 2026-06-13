import { Module } from '@nestjs/common';
import { SellerBalancesController } from './seller-balances.controller';
import { SellerBalancesService } from './seller-balances.service';

@Module({
  controllers: [SellerBalancesController],
  providers: [SellerBalancesService],
  exports: [SellerBalancesService],
})
export class SellerBalancesModule {}
