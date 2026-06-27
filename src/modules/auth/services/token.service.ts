import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { StringValue } from 'ms';
import { Repository } from 'typeorm';

import { JwtPayloadInterface } from '../../../common/interfaces/jwt-payload.interface';
import { parseDurationToMs } from '../../../common/utils/cookie.util';
import { hashToken } from '../../../common/utils/hash.util';
import { User } from '../../users/entities/user.entity';
import { UserStatus } from '../../users/enums/user-status.enum';
import { RefreshSession } from '../entities/refresh-session.entity';

interface SessionMetadata {
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshSession)
    private readonly refreshSessionsRepository: Repository<RefreshSession>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async issueTokenPair(user: User, metadata: SessionMetadata) {
    const accessTtl = this.configService.getOrThrow<StringValue>(
      'JWT_ACCESS_EXPIRES_IN',
    );
    const refreshTtl = this.configService.getOrThrow<StringValue>(
      'JWT_REFRESH_EXPIRES_IN',
    );
    const refreshExpiresAt = new Date(
      Date.now() + parseDurationToMs(refreshTtl),
    );

    const session = this.refreshSessionsRepository.create({
      userId: user.id,
      refreshTokenHash: 'pending',
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
      expiresAt: refreshExpiresAt,
      revokedAt: null,
    });

    const savedSession = await this.refreshSessionsRepository.save(session);

    const accessPayload: JwtPayloadInterface = {
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      type: 'access',
    };

    const refreshPayload: JwtPayloadInterface = {
      ...accessPayload,
      sessionId: savedSession.id,
      type: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessTtl,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTtl,
      }),
    ]);

    savedSession.refreshTokenHash = hashToken(refreshToken);
    await this.refreshSessionsRepository.save(savedSession);

    return {
      accessToken,
      accessTokenMaxAge: parseDurationToMs(accessTtl),
      refreshToken,
      refreshTokenMaxAge: parseDurationToMs(refreshTtl),
    };
  }

  async rotateRefreshToken(refreshToken: string, metadata: SessionMetadata) {
    const payload = await this.verifyRefreshToken(refreshToken);

    if (!payload.sessionId) {
      throw new UnauthorizedException('Refresh session is invalid');
    }

    const session = await this.refreshSessionsRepository.findOne({
      where: {
        id: payload.sessionId,
        userId: payload.sub,
      },
      relations: {
        user: true,
      },
    });

    if (!session || !session.user) {
      throw new UnauthorizedException('Refresh session not found');
    }

    if (session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh session expired');
    }

    if (session.refreshTokenHash !== hashToken(refreshToken)) {
      session.revokedAt = new Date();
      await this.refreshSessionsRepository.save(session);
      throw new UnauthorizedException('Refresh session compromised');
    }

    if (session.user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User is not active');
    }

    const accessTtl = this.configService.getOrThrow<StringValue>(
      'JWT_ACCESS_EXPIRES_IN',
    );
    const refreshTtl = this.configService.getOrThrow<StringValue>(
      'JWT_REFRESH_EXPIRES_IN',
    );
    const accessPayload: JwtPayloadInterface = {
      sub: session.user.id,
      email: session.user.email,
      role: session.user.role,
      status: session.user.status,
      isEmailVerified: session.user.isEmailVerified,
      type: 'access',
    };
    const refreshPayload: JwtPayloadInterface = {
      ...accessPayload,
      sessionId: session.id,
      type: 'refresh',
    };

    const [nextAccessToken, nextRefreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessTtl,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTtl,
      }),
    ]);

    session.refreshTokenHash = hashToken(nextRefreshToken);
    session.expiresAt = new Date(Date.now() + parseDurationToMs(refreshTtl));
    session.ipAddress = metadata.ipAddress;
    session.userAgent = metadata.userAgent;
    await this.refreshSessionsRepository.save(session);

    const user = await this.usersRepository.findOneOrFail({
      where: {
        id: session.user.id,
      },
      relations: {
        profile: true,
        addresses: true,
      },
    });

    return {
      accessToken: nextAccessToken,
      accessTokenMaxAge: parseDurationToMs(accessTtl),
      refreshToken: nextRefreshToken,
      refreshTokenMaxAge: parseDurationToMs(refreshTtl),
      user,
    };
  }

  async revokeRefreshToken(
    refreshToken: string | undefined | null,
  ): Promise<void> {
    if (!refreshToken) {
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayloadInterface>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
          ignoreExpiration: true,
        },
      );

      if (!payload.sessionId) {
        return;
      }

      await this.refreshSessionsRepository.update(
        {
          id: payload.sessionId,
          userId: payload.sub,
        },
        {
          revokedAt: new Date(),
        },
      );
    } catch {
      return;
    }
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.refreshSessionsRepository
      .createQueryBuilder()
      .update(RefreshSession)
      .set({
        revokedAt: new Date(),
      })
      .where('userId = :userId', { userId })
      .andWhere('revokedAt IS NULL')
      .execute();
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<JwtPayloadInterface> {
    const payload = await this.jwtService.verifyAsync<JwtPayloadInterface>(
      refreshToken,
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      },
    );

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return payload;
  }
}
