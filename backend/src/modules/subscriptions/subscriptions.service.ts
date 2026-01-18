import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ChangePlanDto } from './dto/change-plan.dto';
import { InviteDto } from './dto/invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { v4 as uuid } from 'uuid';
import * as dayjs from 'dayjs';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async listPlans() {
    return this.prisma.subscriptionPlan.findMany({ orderBy: { monthlyPrice: 'asc' } });
  }

  async current(accountId: string) {
    return this.prisma.subscription.findUnique({
      where: { accountId },
      include: { plan: true },
    });
  }

  async changePlan(accountId: string, dto: ChangePlanDto) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { code: dto.planCode },
    });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const subscription = await this.prisma.subscription.upsert({
      where: { accountId },
      update: {
        planId: plan.id,
        status: 'ACTIVE',
        renewalDate: dayjs().add(1, 'month').toDate(),
      },
      create: {
        accountId,
        planId: plan.id,
        status: 'ACTIVE',
        renewalDate: dayjs().add(1, 'month').toDate(),
      },
      include: { plan: true },
    });

    await this.applyInviteDiscounts(accountId);
    return subscription;
  }

  async invite(accountId: string, dto: InviteDto) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { accountId },
    });

    if (!subscription) {
      throw new BadRequestException('Active subscription required to invite');
    }

    return this.prisma.invitation.create({
      data: {
        token: uuid(),
        inviterAccountId: accountId,
        inviteeEmail: dto.email,
        subscriptionId: subscription.id,
        discountStartsAt: new Date(),
        discountEndsAt: dayjs().add(30, 'day').toDate(),
      },
    });
  }

  async acceptInvite(accountId: string, dto: AcceptInviteDto) {
    const alreadyAccepted = await this.prisma.invitation.findFirst({
      where: { acceptedAccountId: accountId },
    });
    if (alreadyAccepted) {
      throw new BadRequestException('This account already accepted an invitation');
    }

    const invitation = await this.prisma.invitation.findUnique({
      where: { token: dto.token },
    });

    if (!invitation || invitation.status !== 'PENDING') {
      throw new BadRequestException('Invalid invitation token');
    }

    const account = await this.prisma.account.findUnique({ where: { id: accountId } });
    if (!account || account.email !== invitation.inviteeEmail) {
      throw new BadRequestException('Invitation email does not match this account');
    }

    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        acceptedAccountId: accountId,
      },
    });

    return { message: 'Invitation accepted. Discount applies after a paid subscription.' };
  }

  async discounts(accountId: string) {
    return this.prisma.discountLedger.findMany({
      where: { accountId },
      orderBy: { endsAt: 'desc' },
    });
  }

  private async applyInviteDiscounts(accountId: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { acceptedAccountId: accountId, status: 'ACCEPTED' },
    });
    if (!invitation) {
      return;
    }

    const existingInviteeDiscount = await this.prisma.discountLedger.findFirst({
      where: { accountId, invitationId: invitation.id },
    });
    const inviteeHadAnyDiscount = await this.prisma.discountLedger.findFirst({
      where: { accountId, invitationId: { not: null } },
    });
    if (existingInviteeDiscount || inviteeHadAnyDiscount) {
      return;
    }

    const existingInviterDiscount = await this.prisma.discountLedger.findFirst({
      where: { accountId: invitation.inviterAccountId, invitationId: invitation.id },
    });
    const inviterHadAnyDiscount = await this.prisma.discountLedger.findFirst({
      where: { accountId: invitation.inviterAccountId, invitationId: { not: null } },
    });

    const durationDays = this.configService.get<number>('INVITE_DISCOUNT_DAYS', 30);
    const startsAt = invitation.discountStartsAt ?? new Date();
    const endsAt = invitation.discountEndsAt ?? dayjs(startsAt).add(durationDays, 'day').toDate();

    await this.prisma.discountLedger.create({
      data: {
        accountId,
        invitationId: invitation.id,
        startsAt,
        endsAt,
      },
    });

    if (!existingInviterDiscount && !inviterHadAnyDiscount) {
      await this.prisma.discountLedger.create({
        data: {
          accountId: invitation.inviterAccountId,
          invitationId: invitation.id,
          startsAt,
          endsAt,
        },
      });
    }

    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'REDEEMED' },
    });
  }
}
