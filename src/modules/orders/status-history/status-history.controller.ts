import { Controller } from '@nestjs/common';
import { StatusHistoryService } from './status-history.service';

@Controller('orders/status-history')
export class StatusHistoryController {
  constructor(private readonly statushistoryService: StatusHistoryService) {}
}
