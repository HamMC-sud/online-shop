import { Controller } from '@nestjs/common';
import { ExternalSourcesService } from './external-sources.service';

@Controller('integrations/external-sources')
export class ExternalSourcesController {
  constructor(
    private readonly externalsourcesService: ExternalSourcesService,
  ) {}
}
