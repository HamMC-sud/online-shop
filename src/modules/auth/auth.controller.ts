import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

import { REFRESH_COOKIE_NAME } from '../../common/constants/auth.constants';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  clearAuthCookies,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from '../../common/utils/cookie.util';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendEmailVerificationDto } from './dto/resend-email-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyTwoFactorDto } from './dto/verify-two-factor.dto';
import { AuthService } from './services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(
      dto,
      this.extractRequestMetadata(request),
    );

    this.setAuthCookies(response, result);

    return {
      user: result.user,
    };
  }

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(
      dto,
      this.extractRequestMetadata(request),
    );

    this.setAuthCookies(response, result);

    return {
      user: result.user,
    };
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.refresh(
      this.getRefreshTokenFromCookie(request),
      this.extractRequestMetadata(request),
    );

    this.setAuthCookies(response, result);

    return {
      user: result.user,
    };
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logout(
      this.getRefreshTokenFromCookieOptional(request),
    );
    clearAuthCookies(response, this.configService);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser('id') userId: string) {
    return {
      user: await this.authService.getCurrentUser(userId),
    };
  }

  @Public()
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Public()
  @Post('resend-verification')
  async resendVerification(@Body() dto: ResendEmailVerificationDto) {
    return this.authService.resendVerification(dto);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/send')
  async sendTwoFactorCode(@CurrentUser('id') userId: string) {
    return this.authService.sendTwoFactorCode(userId);
  }

  @Public()
  @Post('2fa/verify')
  async verifyTwoFactor(
    @Body() dto: VerifyTwoFactorDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.verifyTwoFactor(
      dto,
      this.extractRequestMetadata(request),
    );

    this.setAuthCookies(response, result);

    return {
      user: result.user,
    };
  }

  @Public()
  @Post('google')
  googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.googleLogin(dto);
  }

  private extractRequestMetadata(request: Request) {
    return {
      ipAddress: request.ip ?? null,
      userAgent: request.headers['user-agent'] ?? null,
    };
  }

  private setAuthCookies(
    response: Response,
    result: {
      accessToken: string;
      accessTokenMaxAge: number;
      refreshToken: string;
      refreshTokenMaxAge: number;
    },
  ) {
    setAccessTokenCookie(
      response,
      result.accessToken,
      result.accessTokenMaxAge,
      this.configService,
    );
    setRefreshTokenCookie(
      response,
      result.refreshToken,
      result.refreshTokenMaxAge,
      this.configService,
    );
  }

  private getRefreshTokenFromCookie(request: Request): string {
    const cookies = request.cookies as Record<string, unknown> | undefined;
    const refreshToken = cookies?.[REFRESH_COOKIE_NAME];

    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new UnauthorizedException('Refresh token cookie is missing');
    }

    return refreshToken;
  }

  private getRefreshTokenFromCookieOptional(
    request: Request,
  ): string | undefined {
    const cookies = request.cookies as Record<string, unknown> | undefined;
    const refreshToken = cookies?.[REFRESH_COOKIE_NAME];

    return typeof refreshToken === 'string' ? refreshToken : undefined;
  }
}
