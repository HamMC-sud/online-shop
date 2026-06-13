import { TelegramModule } from './telegram/telegram.module';

import { Module } from '@nestjs/common';

@Module({
  imports: [TelegramModule],
  exports: [TelegramModule],
})
export class NotificationsModule {}
