import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ViewingService } from './viewing.service';
import { StartViewingDto } from './dto/start-viewing.dto';
import { ViewingProgressDto } from './dto/progress.dto';

@ApiTags('Viewing')
@Controller('viewing')
@UseGuards(JwtAuthGuard)
export class ViewingController {
  constructor(private readonly viewingService: ViewingService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a viewing session' })
  @ApiResponse({ status: 201 })
  async start(@Body() dto: StartViewingDto, @Req() req: any) {
    return this.viewingService.start(req.account.id, dto);
  }

  @Post('progress')
  @ApiOperation({ summary: 'Update viewing progress' })
  @ApiResponse({ status: 200 })
  async progress(@Body() dto: ViewingProgressDto, @Req() req: any) {
    return this.viewingService.progress(req.account.id, dto);
  }

  @Get('profiles/:profileId/in-progress')
  @ApiOperation({ summary: 'Get in-progress viewing sessions' })
  @ApiResponse({ status: 200 })
  async inProgress(@Req() req: any, @Param('profileId') profileId: string) {
    return this.viewingService.inProgress(req.account.id, profileId);
  }

  @Get('profiles/:profileId/completed')
  @ApiOperation({ summary: 'Get completed viewing sessions' })
  @ApiResponse({ status: 200 })
  async completed(@Req() req: any, @Param('profileId') profileId: string) {
    return this.viewingService.completed(req.account.id, profileId);
  }
}
