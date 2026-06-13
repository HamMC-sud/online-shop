import { Controller } from '@nestjs/common';
import { ViewsHistoryService } from './views-history.service';

@Controller('shopping/views-history')
export class ViewsHistoryController {
  constructor(private readonly viewshistoryService: ViewsHistoryService) {}
}
