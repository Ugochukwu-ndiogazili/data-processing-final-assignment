import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { InternalController } from './internal.controller';
import { InternalService } from './internal.service';
import { InternalGuard } from './internal.guard';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [InternalController],
  providers: [InternalService, InternalGuard],
})
export class InternalModule {}
