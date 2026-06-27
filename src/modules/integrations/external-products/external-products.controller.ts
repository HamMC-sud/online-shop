import { Controller } from '@nestjs/common';
import { ExternalProductsService } from './external-products.service';

@Controller('integrations/external-products')
export class ExternalProductsController {
  constructor(
    private readonly externalproductsService: ExternalProductsService,
  ) {}
}
