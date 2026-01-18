import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService as CommonAuthService } from '../../common/services/auth.service';
import { MailService } from '../../common/services/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { EmailDto } from './dto/email.dto';
import { v4 as uuid } from 'uuid';
import * as dayjs from 'dayjs';
import { VerificationType } from '@prisma/client';

@Injectable()
export class AuthService {
  private isProduction: boolean;
  private requireVerification: boolean;

  constructor(
    private prisma: PrismaService,
    private authService: CommonAuthService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    this.requireVerification = this.configService.get<boolean>('REQUIRE_EMAIL_VERIFICATION', true);
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.account.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Account already exists');
    }

    const passwordHash = await this.authService.hashPassword(dto.password);
    const trialDays = this.configService.get<number>('TRIAL_DAYS', 7);

    const account = await this.prisma.account.create({
      data: {
        email: dto.email,
        passwordHash,
        trialEndsAt: dayjs().add(trialDays, 'day').toDate(),
        status: this.requireVerification ? 'PENDING' : 'ACTIVE',
      },
    });

    const verificationToken = await this.sendVerificationEmail(account.id, account.email, 'VERIFY');

    const message = this.requireVerification
      ? 'Account created. Check your inbox to verify.'
      : 'Account created and activated. You can log in now.';
    return this.isProduction
      ? { message }
      : { message, verificationToken };
  }

  async login(dto: LoginDto) {
    const account = await this.prisma.account.findUnique({
      where: { email: dto.email },
      include: { subscription: { include: { plan: true } } },
    });

    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (account.blockedUntil && dayjs(account.blockedUntil).isAfter(dayjs())) {
      throw new HttpException('Account temporarily blocked. Try later.', 423); // 423 = Locked
    }

    const valid = await this.authService.verifyPassword(dto.password, account.passwordHash);

    if (!valid) {
      await this.handleFailedAttempt(account.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (this.requireVerification && account.status !== 'ACTIVE') {
      throw new ForbiddenException('Verify your email before logging in.');
    }

    await this.prisma.account.update({
      where: { id: account.id },
      data: {
        failedAttempts: 0,
        blockedUntil: null,
      },
    });

    const tokens = this.authService.issueAuthTokens(account);
    return {
      account: this.sanitizeAccount(account),
      tokens,
    };
  }

  async verify(dto: TokenDto) {
    const stored = await this.prisma.verificationToken.findUnique({
      where: { token: dto.token },
    });

    if (!stored || stored.type !== 'VERIFY') {
      throw new BadRequestException('Invalid token');
    }

    if (stored.usedAt || dayjs(stored.expiresAt).isBefore(dayjs())) {
      throw new BadRequestException('Token expired or already used');
    }

    await this.prisma.$transaction([
      this.prisma.account.update({
        where: { id: stored.accountId },
        data: { status: 'ACTIVE' },
      }),
      this.prisma.verificationToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Account verified. You can now log in.' };
  }

  async resendVerification(dto: EmailDto) {
    const account = await this.prisma.account.findUnique({
      where: { email: dto.email },
    });

    if (!account) {
      return { message: 'If the account exists, a link was sent.' };
    }

    if (account.status === 'ACTIVE') {
      throw new BadRequestException('Account already verified.');
    }

    await this.sendVerificationEmail(account.id, account.email, 'VERIFY');
    return { message: 'Verification link sent.' };
  }

  async forgotPassword(dto: EmailDto) {
    const account = await this.prisma.account.findUnique({
      where: { email: dto.email },
    });

    if (account) {
      await this.sendVerificationEmail(account.id, account.email, 'RESET');
    }

    return { message: 'If the account exists, instructions were sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const token = await this.prisma.verificationToken.findUnique({
      where: { token: dto.token },
    });

    if (!token || token.type !== 'RESET' || token.usedAt) {
      throw new BadRequestException('Invalid token');
    }

    if (dayjs(token.expiresAt).isBefore(dayjs())) {
      throw new BadRequestException('Token expired');
    }

    const passwordHash = await this.authService.hashPassword(dto.password);

    await this.prisma.$transaction([
      this.prisma.account.update({
        where: { id: token.accountId },
        data: { passwordHash },
      }),
      this.prisma.verificationToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Password updated. You may log in now.' };
  }

  async refresh(dto: RefreshTokenDto) {
    const payload = this.authService.verifyRefreshToken(dto.refreshToken);

    const account = await this.prisma.account.findUnique({
      where: { id: payload.sub },
      include: { subscription: { include: { plan: true } } },
    });

    if (!account) {
      throw new UnauthorizedException('Account not found');
    }

    const tokens = this.authService.issueAuthTokens(account);
    return {
      account: this.sanitizeAccount(account),
      tokens,
    };
  }

  private async sendVerificationEmail(
    accountId: string,
    email: string,
    type: 'VERIFY' | 'RESET',
  ) {
    const verificationType: VerificationType = type === 'RESET' ? 'RESET' : 'VERIFY';
    const token = await this.prisma.verificationToken.create({
      data: {
        token: uuid(),
        type: verificationType,
        accountId,
        expiresAt: dayjs().add(type === 'RESET' ? 2 : 1, 'day').toDate(),
      },
    });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const link =
      type === 'RESET'
        ? `${frontendUrl}/reset-password?token=${token.token}`
        : `${frontendUrl}/verify?token=${token.token}`;

    await this.mailService.sendMail({
      to: email,
      subject: type === 'RESET' ? 'StreamFlix password reset' : 'StreamFlix verification',
      html: this.mailService.buildVerificationTemplate(link, type),
    });
    return token.token;
  }

  private sanitizeAccount(account: any) {
    return {
      id: account.id,
      email: account.email,
      status: account.status,
      trialEndsAt: account.trialEndsAt,
      subscription: account.subscription
        ? {
            status: account.subscription.status,
            plan: account.subscription.plan?.code,
            renewalDate: account.subscription.renewalDate,
          }
        : null,
    };
  }

  private async handleFailedAttempt(accountId: string) {
    const threshold = this.configService.get<number>('BLOCK_THRESHOLD', 3);
    const updated = await this.prisma.account.update({
      where: { id: accountId },
      data: { failedAttempts: { increment: 1 } },
    });

    if (updated.failedAttempts >= threshold) {
      const blockDuration = this.configService.get<number>('BLOCK_DURATION_MIN', 30);
      await this.prisma.account.update({
        where: { id: accountId },
        data: {
          blockedUntil: dayjs().add(blockDuration, 'minute').toDate(),
          failedAttempts: 0,
        },
      });
    }
  }
}
