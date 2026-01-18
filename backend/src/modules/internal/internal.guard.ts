import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const enabled = this.configService.get<boolean>('INTERNAL_API_ENABLED', false);
    if (!enabled) {
      throw new NotFoundException();
    }
    const providedKey = request.headers['x-internal-key'];
    const expectedKey = this.configService.get<string>('INTERNAL_API_KEY');

    if (!providedKey || providedKey !== expectedKey) {
      throw new ForbiddenException('Invalid internal API key');
    }

    return true;
  }
}
