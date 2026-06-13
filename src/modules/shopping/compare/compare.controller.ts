import { Controller } from '@nestjs/common';
import { CompareService } from './compare.service';

@Controller('shopping/compare')
export class CompareController {
  constructor(private readonly compareService: CompareService) {}
}
