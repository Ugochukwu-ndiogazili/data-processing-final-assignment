import { Global, Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { MailService } from './services/mail.service';

@Global()
@Module({
  providers: [AuthService, MailService],
  exports: [AuthService, MailService],
})
export class CommonModule {}
