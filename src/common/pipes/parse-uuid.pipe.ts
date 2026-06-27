import { ParseUUIDPipe as NestParseUUIDPipe } from '@nestjs/common';

export class ParseUuidPipe extends NestParseUUIDPipe {
  constructor() {
    super({
      version: '4',
    });
  }
}
