import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers.authorization as
      | string
      | undefined;

    if (!authorizationHeader) {
      throw new UnauthorizedException('Falta el header Authorization');
    }

    const [type, token] = authorizationHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token JWT inválido');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      const user: AuthenticatedUser = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      request.user = user;

      return true;
    } catch {
      throw new UnauthorizedException('Token expirado o inválido');
    }
  }
}