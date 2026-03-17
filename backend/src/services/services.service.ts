import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ServiceStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { ListServicesQueryDto } from './dto/list-services-query.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async createService(businessId: string, dto: CreateServiceDto) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    const normalizedSlug = dto.slug.toLowerCase().trim();

    const existingService = await this.prisma.service.findFirst({
      where: {
        businessId,
        slug: normalizedSlug,
      },
      select: { id: true },
    });

    if (existingService) {
      throw new ConflictException('Ya existe un servicio con ese slug');
    }

    if (dto.requiresDeposit && dto.depositPercentage === undefined) {
      throw new ConflictException(
        'Si el servicio requiere depósito, debes indicar depositPercentage',
      );
    }

    const service = await this.prisma.service.create({
      data: {
        businessId,
        name: dto.name.trim(),
        slug: normalizedSlug,
        description: dto.description?.trim(),
        durationMinutes: dto.durationMinutes,
        price: new Prisma.Decimal(dto.price),
        isCombo: dto.isCombo ?? false,
        status: ServiceStatus.ACTIVE,
        requiresDeposit: dto.requiresDeposit ?? false,
        depositPercentage:
          dto.depositPercentage !== undefined
            ? new Prisma.Decimal(dto.depositPercentage)
            : null,
      },
    });

    return service;
  }

  async listServices(businessId: string, query: ListServicesQueryDto) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const search = query.search?.trim();

    const where = {
      businessId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { slug: { contains: search, mode: 'insensitive' as const } },
              {
                description: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}