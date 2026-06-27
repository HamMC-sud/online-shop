import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { MAX_TWO_FACTOR_ATTEMPTS } from '../../../common/constants/auth.constants';
import { hashCode, verifyCode } from '../../../common/utils/hash.util';
import { generateNumericCode } from '../../../common/utils/random-code.util';
import { User } from '../../users/entities/user.entity';
import { TwoFactorCode } from '../entities/two-factor-code.entity';
import { AuthNotificationService } from './auth-notification.service';

@Injectable()
export class TwoFactorService {
  constructor(
    private readonly configService: ConfigService,
    private readonly authNotificationService: AuthNotificationService,
    @InjectRepository(TwoFactorCode)
    private readonly twoFactorCodesRepository: Repository<TwoFactorCode>,
  ) {}

  async sendCode(user: User): Promise<void> {
    await this.twoFactorCodesRepository.delete({
      userId: user.id,
      usedAt: IsNull(),
    });

    const code = generateNumericCode();
    const expiresAt = new Date(
      Date.now() +
        this.configService.getOrThrow<number>('TWO_FACTOR_EXPIRES_MINUTES') *
          60 *
          1000,
    );

    const entity = this.twoFactorCodesRepository.create({
      userId: user.id,
      codeHash: await hashCode(code),
      expiresAt,
      usedAt: null,
      attempts: 0,
    });

    await this.twoFactorCodesRepository.save(entity);
    await this.authNotificationService.sendTwoFactorCode(user.email, code);
  }

  async verifyCode(user: User, rawCode: string): Promise<void> {
    const code = await this.twoFactorCodesRepository.findOne({
      where: {
        userId: user.id,
        usedAt: IsNull(),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!code) {
      throw new BadRequestException('Two-factor code not found');
    }

    if (code.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('Two-factor code expired');
    }

    if (code.attempts >= MAX_TWO_FACTOR_ATTEMPTS) {
      throw new BadRequestException('Two-factor attempts exceeded');
    }

    const isValid = await verifyCode(rawCode, code.codeHash);

    if (!isValid) {
      code.attempts += 1;
      await this.twoFactorCodesRepository.save(code);

      if (code.attempts >= MAX_TWO_FACTOR_ATTEMPTS) {
        throw new BadRequestException('Two-factor attempts exceeded');
      }

      throw new BadRequestException('Two-factor code is invalid');
    }

    code.usedAt = new Date();
    await this.twoFactorCodesRepository.save(code);
  }
}
