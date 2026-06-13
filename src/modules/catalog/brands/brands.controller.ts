import { Controller } from '@nestjs/common';
import { BrandsService } from './brands.service';

@Controller('catalog/brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}
}
