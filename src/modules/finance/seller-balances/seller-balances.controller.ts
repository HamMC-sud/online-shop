import { Controller } from '@nestjs/common';
import { SellerBalancesService } from './seller-balances.service';

@Controller('finance/seller-balances')
export class SellerBalancesController {
  constructor(private readonly sellerbalancesService: SellerBalancesService) {}
}
