import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { ChangePlanDto } from './dto/change-plan.dto';
import { InviteDto } from './dto/invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List subscription plans' })
  @ApiResponse({ status: 200 })
  async plans() {
    return this.subscriptionsService.listPlans();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current subscription' })
  @ApiResponse({ status: 200 })
  async current(@Req() req: any) {
    return this.subscriptionsService.current(req.account.id);
  }

  @Post('change-plan')
  @ApiOperation({ summary: 'Change subscription plan' })
  @ApiResponse({ status: 200 })
  async changePlan(@Req() req: any, @Body() dto: ChangePlanDto) {
    return this.subscriptionsService.changePlan(req.account.id, dto);
  }

  @Post('invite')
  @ApiOperation({ summary: 'Send an invitation' })
  @ApiResponse({ status: 201 })
  async invite(@Req() req: any, @Body() dto: InviteDto) {
    return this.subscriptionsService.invite(req.account.id, dto);
  }

  @Post('accept')
  @ApiOperation({ summary: 'Accept an invitation token' })
  @ApiResponse({ status: 200 })
  async acceptInvite(@Req() req: any, @Body() dto: AcceptInviteDto) {
    return this.subscriptionsService.acceptInvite(req.account.id, dto);
  }

  @Get('discounts')
  @ApiOperation({ summary: 'List active discounts' })
  @ApiResponse({ status: 200 })
  async discounts(@Req() req: any) {
    return this.subscriptionsService.discounts(req.account.id);
  }
}
