import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InternalService {
  constructor(private prisma: PrismaService) {}

  async listAccounts() {
    return this.prisma.account.findMany({
      include: { profiles: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async viewingHistory() {
    return this.prisma.watchEvent.findMany({
      include: { account: true, profile: true, title: true },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
  }
}
