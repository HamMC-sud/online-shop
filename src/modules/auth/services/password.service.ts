import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import {
  generateOpaqueToken,
  hashPassword,
  hashToken,
} from '../../../common/utils/hash.util';
import { User } from '../../users/entities/user.entity';
import { UserStatus } from '../../users/enums/user-status.enum';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { AuthNotificationService } from './auth-notification.service';
import { TokenService } from './token.service';

@Injectable()
export class PasswordService {
  constructor(
    private readonly configService: ConfigService,
    private readonly authNotificationService: AuthNotificationService,
    private readonly tokenService: TokenService,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokensRepository: Repository<PasswordResetToken>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async sendResetToken(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: {
        email,
      },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      return;
    }

    await this.passwordResetTokensRepository.delete({
      userId: user.id,
      usedAt: IsNull(),
    });

    const rawToken = generateOpaqueToken();
    const expiresAt = new Date(
      Date.now() +
        this.configService.getOrThrow<number>(
          'PASSWORD_RESET_EXPIRES_MINUTES',
        ) *
          60 *
          1000,
    );

    const resetToken = this.passwordResetTokensRepository.create({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt,
      usedAt: null,
    });

    await this.passwordResetTokensRepository.save(resetToken);
    await this.authNotificationService.sendPasswordReset(user.email, rawToken);
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const resetToken = await this.passwordResetTokensRepository.findOne({
      where: {
        tokenHash: hashToken(rawToken),
      },
      relations: {
        user: true,
      },
    });

    if (!resetToken || !resetToken.user) {
      throw new BadRequestException('Reset token is invalid');
    }

    if (resetToken.usedAt) {
      throw new BadRequestException('Reset token already used');
    }

    if (resetToken.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('Reset token expired');
    }

    resetToken.usedAt = new Date();
    resetToken.user.passwordHash = await hashPassword(newPassword);

    await this.passwordResetTokensRepository.save(resetToken);
    await this.usersRepository.save(resetToken.user);
    await this.tokenService.revokeAllUserSessions(resetToken.user.id);
  }
}
