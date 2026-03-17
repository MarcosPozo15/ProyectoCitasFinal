import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PromotionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { ListPromotionsQueryDto } from './dto/list-promotions-query.dto';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertBusinessExists(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, status: true },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    return business;
  }

  private async assertServiceInBusiness(
    businessId: string,
    serviceId?: string,
  ) {
    if (!serviceId) return null;

    const service = await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        businessId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado en este negocio');
    }

    return service;
  }

  async createPromotion(businessId: string, dto: CreatePromotionDto) {
    await this.assertBusinessExists(businessId);
    await this.assertServiceInBusiness(businessId, dto.serviceId);

    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new BadRequestException('Fechas inválidas');
    }

    if (endsAt <= startsAt) {
      throw new BadRequestException('La fecha de fin debe ser posterior al inicio');
    }

    if (dto.type === PromotionType.PERCENTAGE && dto.value > 100) {
      throw new BadRequestException(
        'Una promo porcentual no puede ser mayor que 100',
      );
    }

    return this.prisma.promotion.create({
      data: {
        businessId,
        serviceId: dto.serviceId,
        name: dto.name.trim(),
        description: dto.description?.trim(),
        type: dto.type,
        value: new Prisma.Decimal(dto.value),
        startsAt,
        endsAt,
        isActive: dto.isActive ?? true,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async listPromotions(businessId: string, query: ListPromotionsQueryDto) {
    await this.assertBusinessExists(businessId);

    const now = new Date();
    const activeOnly = query.activeOnly === 'true';

    const where: Prisma.PromotionWhereInput = {
      businessId,
      ...(query.serviceId ? { serviceId: query.serviceId } : {}),
      ...(activeOnly
        ? {
            isActive: true,
            startsAt: { lte: now },
            endsAt: { gte: now },
          }
        : {}),
    };

    const items = await this.prisma.promotion.findMany({
      where,
      orderBy: [{ startsAt: 'asc' }, { createdAt: 'desc' }],
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      items,
      meta: {
        total: items.length,
      },
    };
  }

  async listPublicActivePromotions(
    businessId: string,
    query: ListPromotionsQueryDto,
  ) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, status: true },
    });

    if (!business || business.status !== 'ACTIVE') {
      throw new NotFoundException('Negocio no encontrado');
    }

    const now = new Date();

    const items = await this.prisma.promotion.findMany({
      where: {
        businessId,
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
        ...(query.serviceId ? { serviceId: query.serviceId } : {}),
      },
      orderBy: [{ startsAt: 'asc' }, { createdAt: 'desc' }],
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      items,
      meta: {
        total: items.length,
      },
    };
  }
}