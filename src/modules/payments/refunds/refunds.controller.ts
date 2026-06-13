import { Controller } from '@nestjs/common';
import { RefundsService } from './refunds.service';

@Controller('payments/refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}
}
