import { Controller } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('catalog/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
}
