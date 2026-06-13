import { Controller } from '@nestjs/common';
import { MediaService } from './media.service';

@Controller('catalog/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}
}
