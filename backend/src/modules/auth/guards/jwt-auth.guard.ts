import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthService } from '../../../common/services/auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    try {
      const decoded = this.authService.verifyAccessToken(token);
      const account = await this.prisma.account.findUnique({
        where: { id: decoded.sub },
        include: {
          subscription: {
            include: { plan: true },
          },
          discounts: true,
        },
      });

      if (!account) {
        throw new UnauthorizedException('Account not found');
      }

      request.account = account;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
