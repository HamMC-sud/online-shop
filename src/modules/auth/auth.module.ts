import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { LoginHistory } from './entities/login-history.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { RefreshSession } from './entities/refresh-session.entity';
import { TwoFactorCode } from './entities/two-factor-code.entity';
import { AuthNotificationService } from './services/auth-notification.service';
import { AuthService } from './services/auth.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { TwoFactorService } from './services/two-factor.service';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      RefreshSession,
      LoginHistory,
      EmailVerificationToken,
      PasswordResetToken,
      TwoFactorCode,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    PasswordService,
    EmailVerificationService,
    TwoFactorService,
    AuthNotificationService,
  ],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
