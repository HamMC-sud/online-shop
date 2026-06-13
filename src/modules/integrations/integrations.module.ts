import { ExternalSourcesModule } from './external-sources/external-sources.module';
import { ExternalProductsModule } from './external-products/external-products.module';
import { SyncLogsModule } from './sync-logs/sync-logs.module';

import { Module } from '@nestjs/common';

@Module({
  imports: [ExternalSourcesModule, ExternalProductsModule, SyncLogsModule],
  exports: [ExternalSourcesModule, ExternalProductsModule, SyncLogsModule],
})
export class IntegrationsModule {}
