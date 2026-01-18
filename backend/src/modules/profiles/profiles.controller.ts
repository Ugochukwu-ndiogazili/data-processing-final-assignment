import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { WatchlistDto } from './dto/watchlist.dto';

@ApiTags('Profiles')
@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  @ApiOperation({ summary: 'List profiles for the current account' })
  @ApiResponse({ status: 200 })
  async list(@Req() req: any) {
    return this.profilesService.listProfiles(req.account.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a profile' })
  @ApiResponse({ status: 201 })
  async create(@Req() req: any, @Body() dto: CreateProfileDto) {
    return this.profilesService.createProfile(req.account.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a profile' })
  @ApiResponse({ status: 200 })
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.profilesService.updateProfile(req.account.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a profile' })
  @ApiResponse({ status: 200 })
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.profilesService.removeProfile(req.account.id, id);
  }

  @Get(':id/watchlist')
  @ApiOperation({ summary: 'Get watchlist for a profile' })
  @ApiResponse({ status: 200 })
  async watchlist(@Req() req: any, @Param('id') id: string) {
    return this.profilesService.getWatchlist(req.account.id, id);
  }

  @Post(':id/watchlist')
  @ApiOperation({ summary: 'Add title to watchlist' })
  @ApiResponse({ status: 201 })
  async addToWatchlist(@Req() req: any, @Param('id') id: string, @Body() dto: WatchlistDto) {
    return this.profilesService.addToWatchlist(req.account.id, id, dto.titleId);
  }

  @Delete(':id/watchlist/:titleId')
  @ApiOperation({ summary: 'Remove title from watchlist' })
  @ApiResponse({ status: 200 })
  async removeFromWatchlist(
    @Req() req: any,
    @Param('id') id: string,
    @Param('titleId') titleId: string,
  ) {
    return this.profilesService.removeFromWatchlist(req.account.id, id, titleId);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get viewing history for a profile' })
  @ApiResponse({ status: 200 })
  async history(@Req() req: any, @Param('id') id: string) {
    return this.profilesService.history(req.account.id, id);
  }
}
