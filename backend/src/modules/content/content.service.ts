import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GuidelineFlag, ProfileAgeCategory, TitleType } from '@prisma/client';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async listTitles(params: {
    search?: string;
    type?: string;
    guideline?: string;
    profileId?: string;
  }) {
    const where: any = {};

    if (params.profileId) {
      const profile = await this.prisma.profile.findUnique({
        where: { id: params.profileId },
      });
      if (profile) {
        const allowedAges = this.getAllowedAgeCategories(profile.ageCategory);
        where.minAge = { in: allowedAges };

        const preferences = (profile.preferences as any) || {};
        if (Array.isArray(preferences.genres) && preferences.genres.length) {
          where.genres = { hasSome: preferences.genres };
        }
        if (typeof preferences.type === 'string') {
          where.type = preferences.type;
        }
        if (Array.isArray(preferences.blockedGuidelines) && preferences.blockedGuidelines.length) {
          where.NOT = [{ guidelineFlags: { hasSome: preferences.blockedGuidelines } }];
        }
      }
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { synopsis: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.type && Object.values(TitleType).includes(params.type as TitleType)) {
      where.type = params.type;
    }

    if (params.guideline && Object.values(GuidelineFlag).includes(params.guideline as GuidelineFlag)) {
      where.guidelineFlags = { has: params.guideline };
    }

    return this.prisma.title.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getTitle(slug: string) {
    return this.prisma.title.findUnique({
      where: { slug },
      include: { seasons: { include: { episodes: true } }, subtitles: true },
    });
  }

  listGuidelines() {
    return Object.values(GuidelineFlag).map((value) => ({
      code: value,
      label: value.replace('_', ' ').toLowerCase(),
    }));
  }

  private getAllowedAgeCategories(age: ProfileAgeCategory) {
    const order = [ProfileAgeCategory.KIDS, ProfileAgeCategory.TEEN, ProfileAgeCategory.ADULT];
    const maxIndex = order.indexOf(age);
    return order.slice(0, maxIndex + 1);
  }
}
