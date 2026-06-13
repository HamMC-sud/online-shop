import { Controller } from '@nestjs/common';
import { ModerationService } from './moderation.service';

@Controller('catalog/moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}
}
