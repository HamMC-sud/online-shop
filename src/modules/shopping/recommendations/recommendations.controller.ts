import { Controller } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller('shopping/recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}
}
