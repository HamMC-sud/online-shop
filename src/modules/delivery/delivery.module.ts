import { ProvidersModule } from './providers/providers.module';
import { PickupPointsModule } from './pickup-points/pickup-points.module';
import { ReturnsModule } from './returns/returns.module';

import { Module } from '@nestjs/common';

@Module({
  imports: [ProvidersModule, PickupPointsModule, ReturnsModule],
  exports: [ProvidersModule, PickupPointsModule, ReturnsModule],
})
export class DeliveryModule {}
