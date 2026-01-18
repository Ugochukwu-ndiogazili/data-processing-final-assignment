import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { ExternalController } from './external.controller';
import { ExternalService } from './external.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [ExternalController],
  providers: [ExternalService],
})
export class ExternalModule {}
