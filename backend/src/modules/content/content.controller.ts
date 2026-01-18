import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContentService } from './content.service';

@ApiTags('Content')
@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('titles')
  @ApiOperation({ summary: 'List content titles' })
  @ApiResponse({ status: 200 })
  async list(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('guideline') guideline?: string,
    @Query('profileId') profileId?: string,
  ) {
    return this.contentService.listTitles({ search, type, guideline, profileId });
  }

  @Get('titles/:slug')
  @ApiOperation({ summary: 'Get title details' })
  @ApiResponse({ status: 200 })
  async detail(@Param('slug') slug: string) {
    return this.contentService.getTitle(slug);
  }

  @Get('guidelines')
  @ApiOperation({ summary: 'List content guideline flags' })
  @ApiResponse({ status: 200 })
  guidelines() {
    return this.contentService.listGuidelines();
  }
}
