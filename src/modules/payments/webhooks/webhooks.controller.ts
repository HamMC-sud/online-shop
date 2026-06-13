import { Controller } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('payments/webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}
}
