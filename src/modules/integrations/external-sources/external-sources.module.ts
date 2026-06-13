import { Module } from '@nestjs/common';
import { ExternalSourcesController } from './external-sources.controller';
import { ExternalSourcesService } from './external-sources.service';

@Module({
  controllers: [ExternalSourcesController],
  providers: [ExternalSourcesService],
  exports: [ExternalSourcesService],
})
export class ExternalSourcesModule {}
