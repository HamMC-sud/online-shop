import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

import {
  ACCESS_COOKIE_NAME,
  ACCESS_TOKEN_TYPE,
} from '../constants/auth.constants';
import { IS_PUBLIC_KEY } from '../constants/auth.constants';
import { CurrentUserInterface } from '../interfaces/current-user.interface';
import { JwtPayloadInterface } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      cookies?: Record<string, unknown>;
      user?: CurrentUserInterface;
    }>();
    const token = this.extractAccessToken(request);

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    const payload = await this.jwtService.verifyAsync<JwtPayloadInterface>(
      token,
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      },
    );

    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid access token');
    }

    request.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      status: payload.status,
      isEmailVerified: payload.isEmailVerified,
      sessionId: payload.sessionId,
    };

    return true;
  }

  private extractAccessToken(request: {
    headers: Record<string, string | string[] | undefined>;
    cookies?: Record<string, unknown>;
  }): string | null {
    const bearerToken = this.extractBearerToken(request.headers.authorization);

    if (bearerToken) {
      return bearerToken;
    }

    const cookieToken = request.cookies?.[ACCESS_COOKIE_NAME];
    return typeof cookieToken === 'string' ? cookieToken : null;
  }

  private extractBearerToken(
    authorizationHeader?: string | string[],
  ): string | null {
    if (!authorizationHeader || Array.isArray(authorizationHeader)) {
      return null;
    }

    const [type, token] = authorizationHeader.split(' ');

    if (type !== ACCESS_TOKEN_TYPE || !token) {
      return null;
    }

    return token;
  }
}
