import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  async hashPassword(password: string): Promise<string> {
    const configuredRounds = this.configService.get<string>('PASSWORD_SALT_ROUNDS');
    const saltRounds = Number.parseInt(configuredRounds ?? '12', 10);
    return bcrypt.hash(password, Number.isNaN(saltRounds) ? 12 : saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateAccessToken(payload: { sub: string; email: string }): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    const expiration = this.configService.get<string>('JWT_EXPIRATION', '15m');
    return jwt.sign(payload, secret, { expiresIn: expiration });
  }

  generateRefreshToken(payload: { sub: string; email: string }): string {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const days = this.configService.get<number>('REFRESH_EXPIRATION_DAYS', 7);
    return jwt.sign(payload, secret, { expiresIn: `${days}d` });
  }

  verifyAccessToken(token: string): { sub: string; email: string } {
    const secret = this.configService.get<string>('JWT_SECRET');
    return jwt.verify(token, secret) as { sub: string; email: string };
  }

  verifyRefreshToken(token: string): { sub: string; email: string } {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    return jwt.verify(token, secret) as { sub: string; email: string };
  }

  issueAuthTokens(account: { id: string; email: string }) {
    const payload = { sub: account.id, email: account.email };
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }
}
