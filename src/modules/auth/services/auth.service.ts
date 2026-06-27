import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { hashPassword, verifyPassword } from '../../../common/utils/hash.util';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/enums/user-role.enum';
import { UserStatus } from '../../users/enums/user-status.enum';
import { UsersService } from '../../users/users.service';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { GoogleLoginDto } from '../dto/google-login.dto';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ResendEmailVerificationDto } from '../dto/resend-email-verification.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { VerifyTwoFactorDto } from '../dto/verify-two-factor.dto';
import { LoginHistory } from '../entities/login-history.entity';
import { LoginFailureReason } from '../enums/login-failure-reason.enum';
import { EmailVerificationService } from './email-verification.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { TwoFactorService } from './two-factor.service';

interface RequestMetadata {
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly twoFactorService: TwoFactorService,
    @InjectRepository(LoginHistory)
    private readonly loginHistoryRepository: Repository<LoginHistory>,
  ) {}

  async register(dto: RegisterDto, metadata: RequestMetadata) {
    if (dto.role === UserRole.ADMIN) {
      throw new BadRequestException('Admin registration is not allowed');
    }

    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const user = await this.usersService.createUserWithProfile({
      email: dto.email,
      passwordHash: await hashPassword(dto.password),
      role: dto.role ?? UserRole.USER,
      isEmailVerified: false,
    });

    await this.emailVerificationService.createToken(user);
    user.lastLoginAt = new Date();
    await this.usersService.updateLastLoginAt(user.id, user.lastLoginAt);
    const tokens = await this.tokenService.issueTokenPair(user, metadata);

    return {
      user: this.usersService.toSafeUserResponse(user),
      accessToken: tokens.accessToken,
      accessTokenMaxAge: tokens.accessTokenMaxAge,
      refreshToken: tokens.refreshToken,
      refreshTokenMaxAge: tokens.refreshTokenMaxAge,
    };
  }

  async login(dto: LoginDto, metadata: RequestMetadata) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      await this.recordLoginHistory({
        userId: null,
        email: dto.email,
        success: false,
        failureReason: LoginFailureReason.USER_NOT_FOUND,
        metadata,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (
      !user.passwordHash ||
      !(await verifyPassword(dto.password, user.passwordHash))
    ) {
      await this.recordLoginHistory({
        userId: user.id,
        email: user.email,
        success: false,
        failureReason: LoginFailureReason.INVALID_CREDENTIALS,
        metadata,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    this.assertUserCanAuthenticate(user);

    user.lastLoginAt = new Date();
    const tokens = await this.tokenService.issueTokenPair(user, metadata);

    await this.usersService.updateLastLoginAt(user.id, user.lastLoginAt);

    await this.recordLoginHistory({
      userId: user.id,
      email: user.email,
      success: true,
      failureReason: null,
      metadata,
    });

    return {
      user: this.usersService.toSafeUserResponse(user),
      accessToken: tokens.accessToken,
      accessTokenMaxAge: tokens.accessTokenMaxAge,
      refreshToken: tokens.refreshToken,
      refreshTokenMaxAge: tokens.refreshTokenMaxAge,
    };
  }

  async verifyTwoFactor(dto: VerifyTwoFactorDto, metadata: RequestMetadata) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      await this.recordLoginHistory({
        userId: null,
        email: dto.email,
        success: false,
        failureReason: LoginFailureReason.USER_NOT_FOUND,
        metadata,
      });
      throw new UnauthorizedException('Invalid authentication flow');
    }

    this.assertUserCanAuthenticate(user);

    try {
      await this.twoFactorService.verifyCode(user, dto.code);
    } catch (error) {
      await this.recordLoginHistory({
        userId: user.id,
        email: user.email,
        success: false,
        failureReason:
          error instanceof BadRequestException &&
          error.message.includes('exceeded')
            ? LoginFailureReason.TWO_FACTOR_ATTEMPTS_EXCEEDED
            : error instanceof BadRequestException &&
                error.message.includes('expired')
              ? LoginFailureReason.TWO_FACTOR_EXPIRED
              : LoginFailureReason.TWO_FACTOR_INVALID,
        metadata,
      });
      throw error;
    }

    user.lastLoginAt = new Date();
    const tokens = await this.tokenService.issueTokenPair(user, metadata);
    await this.usersService.updateLastLoginAt(user.id, user.lastLoginAt);

    await this.recordLoginHistory({
      userId: user.id,
      email: user.email,
      success: true,
      failureReason: null,
      metadata,
    });

    return {
      user: this.usersService.toSafeUserResponse(user),
      accessToken: tokens.accessToken,
      accessTokenMaxAge: tokens.accessTokenMaxAge,
      refreshToken: tokens.refreshToken,
      refreshTokenMaxAge: tokens.refreshTokenMaxAge,
    };
  }

  async refresh(refreshToken: string, metadata: RequestMetadata) {
    const tokens = await this.tokenService.rotateRefreshToken(
      refreshToken,
      metadata,
    );

    return {
      accessToken: tokens.accessToken,
      accessTokenMaxAge: tokens.accessTokenMaxAge,
      refreshToken: tokens.refreshToken,
      refreshTokenMaxAge: tokens.refreshTokenMaxAge,
      user: this.usersService.toSafeUserResponse(tokens.user),
    };
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    await this.tokenService.revokeRefreshToken(refreshToken);
  }

  async getCurrentUser(userId: string) {
    return this.usersService.getCurrentUser(userId);
  }

  async verifyEmail(dto: VerifyEmailDto) {
    await this.emailVerificationService.verifyToken(dto.token);

    return {
      message: 'Email verified successfully',
    };
  }

  async resendVerification(dto: ResendEmailVerificationDto) {
    await this.emailVerificationService.resend(dto.email);

    return {
      message: 'If the account exists, a verification email has been queued.',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    await this.passwordService.sendResetToken(dto.email);

    return {
      message: 'If the account exists, a password reset email has been queued.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    await this.passwordService.resetPassword(dto.token, dto.newPassword);

    return {
      message: 'Password updated successfully',
    };
  }

  async sendTwoFactorCode(userId: string) {
    const user = await this.usersService.findByIdOrFail(userId);
    this.assertUserCanAuthenticate(user);
    await this.twoFactorService.sendCode(user);

    return {
      message: 'Two-factor code sent.',
    };
  }

  googleLogin(dto: GoogleLoginDto) {
    void dto;
    throw new NotImplementedException(
      'Google login is prepared but provider verification is not implemented yet.',
    );
  }

  private assertUserCanAuthenticate(user: User): void {
    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('User is blocked');
    }

    if (user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('User is banned');
    }

    if (user.status === UserStatus.DELETED) {
      throw new UnauthorizedException('User is deleted');
    }
  }

  private async recordLoginHistory(params: {
    userId: string | null;
    email: string;
    success: boolean;
    failureReason: LoginFailureReason | null;
    metadata: RequestMetadata;
  }): Promise<void> {
    const record = this.loginHistoryRepository.create({
      userId: params.userId,
      email: params.email,
      ipAddress: params.metadata.ipAddress,
      userAgent: params.metadata.userAgent,
      success: params.success,
      failureReason: params.failureReason,
    });

    await this.loginHistoryRepository.save(record);
  }
}
