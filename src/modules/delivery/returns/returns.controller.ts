import { Controller } from '@nestjs/common';
import { ReturnsService } from './returns.service';

@Controller('delivery/returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}
}
