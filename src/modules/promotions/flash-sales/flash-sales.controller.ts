import { Controller } from '@nestjs/common';
import { FlashSalesService } from './flash-sales.service';

@Controller('promotions/flash-sales')
export class FlashSalesController {
  constructor(private readonly flashsalesService: FlashSalesService) {}
}
