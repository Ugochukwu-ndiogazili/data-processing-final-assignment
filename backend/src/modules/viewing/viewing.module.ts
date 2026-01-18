import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ViewingController } from './viewing.controller';
import { ViewingService } from './viewing.service';

@Module({
  imports: [PrismaModule],
  controllers: [ViewingController],
  providers: [ViewingService],
})
export class ViewingModule {}
