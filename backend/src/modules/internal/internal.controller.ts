import { Controller, Get, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InternalGuard } from './internal.guard';
import { InternalService } from './internal.service';

@ApiTags('Internal')
@Controller('internal')
@UseGuards(InternalGuard)
export class InternalController {
  constructor(private readonly internalService: InternalService) {}

  @Get('accounts')
  @ApiOperation({ summary: 'List recent accounts (internal)' })
  @ApiResponse({ status: 200 })
  async accounts() {
    return this.internalService.listAccounts();
  }

  @Get('viewing-history')
  @ApiOperation({ summary: 'List recent viewing history (senior only)' })
  @ApiResponse({ status: 200 })
  async viewing(@Req() req: any) {
    const role = String(req.headers['x-internal-role'] || '').toUpperCase();
    if (role !== 'SENIOR') {
      throw new ForbiddenException('Senior role required');
    }
    return this.internalService.viewingHistory();
  }
}
