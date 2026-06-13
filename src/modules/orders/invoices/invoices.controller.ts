import { Controller } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

@Controller('orders/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}
}
