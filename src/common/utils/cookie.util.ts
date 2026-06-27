import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

import {
  ACCESS_COOKIE_NAME,
  AUTH_COOKIE_PATH,
  REFRESH_COOKIE_NAME,
} from '../constants/auth.constants';

export function parseDurationToMs(duration: string): number {
  const match = /^(\d+)([smhd])$/i.exec(duration.trim());

  if (!match) {
    throw new Error(`Unsupported duration format: ${duration}`);
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  const multiplierMap: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multiplierMap[unit];
}

export function setRefreshTokenCookie(
  response: Response,
  refreshToken: string,
  maxAge: number,
  configService: ConfigService,
): void {
  response.cookie(REFRESH_COOKIE_NAME, refreshToken, buildCookieOptions(maxAge, configService));
}

export function setAccessTokenCookie(
  response: Response,
  accessToken: string,
  maxAge: number,
  configService: ConfigService,
): void {
  response.cookie(ACCESS_COOKIE_NAME, accessToken, buildCookieOptions(maxAge, configService));
}

export function clearAuthCookies(
  response: Response,
  configService: ConfigService,
): void {
  const options = buildCookieOptions(0, configService);

  response.clearCookie(ACCESS_COOKIE_NAME, {
    httpOnly: options.httpOnly,
    sameSite: options.sameSite,
    secure: options.secure,
    path: options.path,
    domain: options.domain,
  });
  response.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: options.httpOnly,
    sameSite: options.sameSite,
    secure: options.secure,
    path: options.path,
    domain: options.domain,
  });
}

function buildCookieOptions(maxAge: number, configService: ConfigService) {
  const sameSite = configService.get<'lax' | 'none' | 'strict'>(
    'COOKIE_SAME_SITE',
    'lax',
  );
  const isProduction = configService.get('NODE_ENV') === 'production';
  const domain = configService.get<string>('COOKIE_DOMAIN');

  return {
    httpOnly: true,
    sameSite,
    secure: isProduction || sameSite === 'none',
    path: AUTH_COOKIE_PATH,
    maxAge,
    ...(domain ? { domain } : {}),
  } as const;
}
