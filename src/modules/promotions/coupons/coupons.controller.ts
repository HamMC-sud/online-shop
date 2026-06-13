import { Controller } from '@nestjs/common';
import { CouponsService } from './coupons.service';

@Controller('promotions/coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}
}
