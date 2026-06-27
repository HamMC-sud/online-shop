import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import {
  generateOpaqueToken,
  hashToken,
} from '../../../common/utils/hash.util';
import { User } from '../../users/entities/user.entity';
import { UserStatus } from '../../users/enums/user-status.enum';
import { EmailVerificationToken } from '../entities/email-verification-token.entity';
import { AuthNotificationService } from './auth-notification.service';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly authNotificationService: AuthNotificationService,
    @InjectRepository(EmailVerificationToken)
    private readonly emailVerificationTokensRepository: Repository<EmailVerificationToken>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createToken(user: User): Promise<void> {
    await this.emailVerificationTokensRepository.delete({
      userId: user.id,
      usedAt: IsNull(),
    });

    const rawToken = generateOpaqueToken();
    const expiresAt = new Date(
      Date.now() +
        this.configService.getOrThrow<number>(
          'EMAIL_VERIFICATION_EXPIRES_MINUTES',
        ) *
          60 *
          1000,
    );

    const token = this.emailVerificationTokensRepository.create({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt,
      usedAt: null,
    });

    await this.emailVerificationTokensRepository.save(token);
    await this.authNotificationService.sendEmailVerification(
      user.email,
      rawToken,
    );
  }

  async verifyToken(rawToken: string): Promise<void> {
    const token = await this.emailVerificationTokensRepository.findOne({
      where: {
        tokenHash: hashToken(rawToken),
      },
      relations: {
        user: true,
      },
    });

    if (!token || !token.user) {
      throw new NotFoundException('Verification token is invalid');
    }

    if (token.usedAt) {
      throw new BadRequestException('Verification token already used');
    }

    if (token.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('Verification token expired');
    }

    token.usedAt = new Date();
    token.user.isEmailVerified = true;

    await this.emailVerificationTokensRepository.save(token);
    await this.usersRepository.save(token.user);
  }

  async resend(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: {
        email,
      },
    });

    if (!user || user.status !== UserStatus.ACTIVE || user.isEmailVerified) {
      return;
    }

    await this.createToken(user);
  }
}
