import { Controller } from '@nestjs/common';
import { CommissionsService } from './commissions.service';

@Controller('finance/commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}
}
