import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class BusinessAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async assertBusinessAccess(params: {
    userId: string;
    role: PlatformRole;
    businessId: string;
  }): Promise<void> {
    const { userId, role, businessId } = params;

    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        adminUserId: true,
      },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    if (role === PlatformRole.SUPERADMIN) {
      return;
    }

    if (role === PlatformRole.BUSINESS_ADMIN) {
      if (business.adminUserId !== userId) {
        throw new ForbiddenException(
          'No tienes permisos sobre este negocio',
        );
      }

      return;
    }

    throw new ForbiddenException('Rol no autorizado para esta operación');
  }
}