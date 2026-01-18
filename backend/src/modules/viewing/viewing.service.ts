import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StartViewingDto } from './dto/start-viewing.dto';
import { ViewingProgressDto } from './dto/progress.dto';

@Injectable()
export class ViewingService {
  constructor(private prisma: PrismaService) {}

  private async ensureProfile(accountId: string, profileId: string) {
    const profile = await this.prisma.profile.findFirst({
      where: { id: profileId, accountId },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found for account');
    }
    return profile;
  }

  async start(accountId: string, dto: StartViewingDto) {
    await this.ensureProfile(accountId, dto.profileId);
    return this.prisma.watchEvent.create({
      data: {
        accountId,
        profileId: dto.profileId,
        titleId: dto.titleId,
        episodeId: dto.episodeId ?? null,
        startedAt: new Date(),
      },
      include: { title: true, episode: true },
    });
  }

  async progress(accountId: string, dto: ViewingProgressDto) {
    await this.ensureProfile(accountId, dto.profileId);
    const event = await this.prisma.watchEvent.findFirst({
      where: {
        accountId,
        profileId: dto.profileId,
        titleId: dto.titleId,
        episodeId: dto.episodeId ?? null,
        completed: false,
      },
      orderBy: { startedAt: 'desc' },
    });

    if (!event) {
      throw new NotFoundException('Viewing session not found');
    }

    const updated = await this.prisma.watchEvent.update({
      where: { id: event.id },
      data: {
        durationWatched:
          dto.durationWatched != null ? dto.durationWatched : event.durationWatched,
        lastPosition: dto.lastPosition != null ? dto.lastPosition : event.lastPosition,
        completed: dto.completed ?? event.completed,
        finishedAt: dto.completed ? new Date() : event.finishedAt,
      },
      include: { title: true, episode: true },
    });

    if (dto.completed) {
      await this.prisma.watchlistItem.deleteMany({
        where: { profileId: dto.profileId, titleId: dto.titleId },
      });
    }

    return updated;
  }

  async inProgress(accountId: string, profileId: string) {
    await this.ensureProfile(accountId, profileId);
    return this.prisma.watchEvent.findMany({
      where: { profileId, completed: false },
      include: { title: true, episode: true },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });
  }

  async completed(accountId: string, profileId: string) {
    await this.ensureProfile(accountId, profileId);
    return this.prisma.watchEvent.findMany({
      where: { profileId, completed: true },
      include: { title: true, episode: true },
      orderBy: { finishedAt: 'desc' },
      take: 20,
    });
  }
}
