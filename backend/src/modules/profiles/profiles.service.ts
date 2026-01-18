import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async listProfiles(accountId: string) {
    return this.prisma.profile.findMany({
      where: { accountId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createProfile(accountId: string, dto: CreateProfileDto) {
    return this.prisma.profile.create({
      data: {
        accountId,
        name: dto.name,
        ageCategory: dto.ageCategory,
      },
    });
  }

  async updateProfile(accountId: string, profileId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    if (profile.accountId !== accountId) {
      throw new ForbiddenException('Profile does not belong to account');
    }
    return this.prisma.profile.update({
      where: { id: profileId },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.ageCategory ? { ageCategory: dto.ageCategory } : {}),
      },
    });
  }

  async removeProfile(accountId: string, profileId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    if (profile.accountId !== accountId) {
      throw new ForbiddenException('Profile does not belong to account');
    }
    await this.prisma.profile.delete({ where: { id: profileId } });
    return { message: 'Profile deleted' };
  }

  private async ensureProfile(accountId: string, profileId: string) {
    const profile = await this.prisma.profile.findFirst({
      where: { id: profileId, accountId },
    });
    if (!profile) {
      throw new ForbiddenException('Profile does not belong to account');
    }
    return profile;
  }

  async getWatchlist(accountId: string, profileId: string) {
    await this.ensureProfile(accountId, profileId);
    return this.prisma.watchlistItem.findMany({
      where: { profileId },
      include: { title: true },
      orderBy: { addedAt: 'desc' },
    });
  }

  async addToWatchlist(accountId: string, profileId: string, titleId: string) {
    await this.ensureProfile(accountId, profileId);
    return this.prisma.watchlistItem.upsert({
      where: { profileId_titleId: { profileId, titleId } },
      update: {},
      create: { profileId, titleId },
    });
  }

  async removeFromWatchlist(accountId: string, profileId: string, titleId: string) {
    await this.ensureProfile(accountId, profileId);
    await this.prisma.watchlistItem.delete({
      where: { profileId_titleId: { profileId, titleId } },
    });
    return { message: 'Removed from watchlist' };
  }

  async history(accountId: string, profileId: string) {
    await this.ensureProfile(accountId, profileId);
    return this.prisma.watchEvent.findMany({
      where: { profileId },
      include: { title: true, episode: true },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
  }
}
