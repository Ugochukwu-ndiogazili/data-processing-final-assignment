import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private isProduction: boolean;

  constructor(private configService: ConfigService) {
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT', 587),
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
    if (!this.isProduction) {
      this.logger.log(`[MAIL:DEV] Attempting to send: ${subject} to ${to}`);
    }

    try {
      const result = await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to,
        subject,
        html,
      });
      if (!this.isProduction) {
        this.logger.log('[MAIL:DEV] Email sent successfully');
      }
      return result;
    } catch (error) {
      if (!this.isProduction) {
        this.logger.warn(`[MAIL:DEV] Email send failed (non-blocking in dev): ${error.message}`);
        return { messageId: 'dev-mock-' + Date.now() };
      }
      throw error;
    }
  }

  buildVerificationTemplate(link: string, type: 'VERIFY' | 'RESET'): string {
    return `
      <div>
        <h2>StreamFlix ${type === 'RESET' ? 'Password Reset' : 'Account Verification'}</h2>
        <p>Click the link below to continue:</p>
        <a href="${link}">${link}</a>
        <p>If you did not request this, you can ignore this message.</p>
      </div>
    `;
  }
}
