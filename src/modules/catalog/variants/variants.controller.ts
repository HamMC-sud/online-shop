import { Controller } from '@nestjs/common';
import { VariantsService } from './variants.service';

@Controller('catalog/variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}
}
