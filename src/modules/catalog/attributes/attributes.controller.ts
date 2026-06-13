import { Controller } from '@nestjs/common';
import { AttributesService } from './attributes.service';

@Controller('catalog/attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}
}
