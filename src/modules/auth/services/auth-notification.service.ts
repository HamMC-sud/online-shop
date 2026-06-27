import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuthNotificationService {
  private readonly logger = new Logger(AuthNotificationService.name);

  sendEmailVerification(email: string, token: string): Promise<void> {
    this.logger.debug(
      `Email verification requested for ${email}. Token delivery is not configured yet.`,
    );
    void token;
    return Promise.resolve();
  }

  sendPasswordReset(email: string, token: string): Promise<void> {
    this.logger.debug(
      `Password reset requested for ${email}. Token delivery is not configured yet.`,
    );
    void token;
    return Promise.resolve();
  }

  sendTwoFactorCode(email: string, code: string): Promise<void> {
    this.logger.debug(
      `Two-factor code requested for ${email}. Mail provider is not configured yet.`,
    );
    void code;
    return Promise.resolve();
  }
}
