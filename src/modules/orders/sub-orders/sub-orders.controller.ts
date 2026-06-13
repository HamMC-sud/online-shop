import { Controller } from '@nestjs/common';
import { SubOrdersService } from './sub-orders.service';

@Controller('orders/sub-orders')
export class SubOrdersController {
  constructor(private readonly subordersService: SubOrdersService) {}
}
