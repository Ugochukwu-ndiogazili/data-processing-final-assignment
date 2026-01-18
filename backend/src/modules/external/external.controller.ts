import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExternalService } from './external.service';

@ApiTags('External')
@Controller('external')
@UseGuards(JwtAuthGuard)
export class ExternalController {
  constructor(private readonly externalService: ExternalService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search TMDB content' })
  @ApiResponse({ status: 200 })
  async search(@Query('q') query: string, @Query('type') type?: string) {
    return this.externalService.search(query, type);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending TMDB content' })
  @ApiResponse({ status: 200 })
  async trending(@Query('type') type?: string) {
    return this.externalService.trending(type);
  }

  @Get('details/:id')
  @ApiOperation({ summary: 'Get TMDB content details' })
  @ApiResponse({ status: 200 })
  async details(@Param('id') id: string, @Query('type') type?: string) {
    return this.externalService.details(id, type);
  }
}
