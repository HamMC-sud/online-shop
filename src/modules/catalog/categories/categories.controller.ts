import { Controller } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('catalog/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
}
