import { Controller } from '@nestjs/common';
import { PickupPointsService } from './pickup-points.service';

@Controller('delivery/pickup-points')
export class PickupPointsController {
  constructor(private readonly pickuppointsService: PickupPointsService) {}
}
