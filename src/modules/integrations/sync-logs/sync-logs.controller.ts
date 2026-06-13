import { Controller } from '@nestjs/common';
import { SyncLogsService } from './sync-logs.service';

@Controller('integrations/sync-logs')
export class SyncLogsController {
  constructor(private readonly synclogsService: SyncLogsService) {}
}
