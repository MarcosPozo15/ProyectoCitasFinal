import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ServiceStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AddServicePackageItemDto } from './dto/add-service-package-item.dto';
import { CreateServicePackageDto } from './dto/create-service-package.dto';
import { ListServicePackagesQueryDto } from './dto/list-service-packages-query.dto';

@Injectable()
export class ServicePackagesService {
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

  private async recalculateTotals(servicePackageId: string) {
    const items = await this.prisma.servicePackageItem.findMany({
      where: { servicePackageId },
      select: {
        durationMinutes: true,
        price: true,
      },
    });

    const totalDurationMin = items.reduce(
      (acc, item) => acc + item.durationMinutes,
      0,
    );

    const totalPrice = items.reduce(
      (acc, item) => acc.add(item.price),
      new Prisma.Decimal(0),
    );

    await this.prisma.servicePackage.update({
      where: { id: servicePackageId },
      data: {
        totalDurationMin,
        totalPrice,
      },
    });
  }

  async createPackage(businessId: string, dto: CreateServicePackageDto) {
    await this.assertBusinessExists(businessId);

    const normalizedSlug = dto.slug.toLowerCase().trim();

    const existing = await this.prisma.servicePackage.findFirst({
      where: {
        businessId,
        slug: normalizedSlug,
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Ya existe un combo con ese slug');
    }

    return this.prisma.servicePackage.create({
      data: {
        businessId,
        name: dto.name.trim(),
        slug: normalizedSlug,
        description: dto.description?.trim(),
        totalDurationMin: 0,
        totalPrice: new Prisma.Decimal(0),
        isActive: dto.isActive ?? true,
      },
    });
  }

  async listPackages(
    businessId: string,
    query: ListServicePackagesQueryDto,
  ) {
    await this.assertBusinessExists(businessId);

    const activeOnly = query.activeOnly === 'true';

    const items = await this.prisma.servicePackage.findMany({
      where: {
        businessId,
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: [{ createdAt: 'desc' }],
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
          include: {
            service: {
              select: {
                id: true,
                name: true,
                slug: true,
                durationMinutes: true,
                price: true,
                status: true,
              },
            },
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

  async getPackageDetail(businessId: string, packageId: string) {
    await this.assertBusinessExists(businessId);

    const item = await this.prisma.servicePackage.findFirst({
      where: {
        id: packageId,
        businessId,
      },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
          include: {
            service: {
              select: {
                id: true,
                name: true,
                slug: true,
                durationMinutes: true,
                price: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Combo no encontrado');
    }

    return item;
  }

  async addItem(
    businessId: string,
    packageId: string,
    dto: AddServicePackageItemDto,
  ) {
    const servicePackage = await this.prisma.servicePackage.findFirst({
      where: {
        id: packageId,
        businessId,
      },
      select: { id: true },
    });

    if (!servicePackage) {
      throw new NotFoundException('Combo no encontrado');
    }

    const service = await this.prisma.service.findFirst({
      where: {
        id: dto.serviceId,
        businessId,
        status: {
          in: [ServiceStatus.ACTIVE, ServiceStatus.INACTIVE],
        },
      },
      select: {
        id: true,
        durationMinutes: true,
        price: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado en este negocio');
    }

    const existing = await this.prisma.servicePackageItem.findFirst({
      where: {
        servicePackageId: packageId,
        serviceId: dto.serviceId,
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Ese servicio ya está añadido al combo');
    }

    const currentCount = await this.prisma.servicePackageItem.count({
      where: { servicePackageId: packageId },
    });

    const created = await this.prisma.servicePackageItem.create({
      data: {
        servicePackageId: packageId,
        serviceId: dto.serviceId,
        sortOrder: dto.sortOrder ?? currentCount,
        durationMinutes: service.durationMinutes,
        price: service.price,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            slug: true,
            durationMinutes: true,
            price: true,
            status: true,
          },
        },
      },
    });

    await this.recalculateTotals(packageId);

    return created;
  }

  async removeItem(
    businessId: string,
    packageId: string,
    itemId: string,
  ) {
    const existing = await this.prisma.servicePackageItem.findFirst({
      where: {
        id: itemId,
        servicePackageId: packageId,
        servicePackage: {
          businessId,
        },
      },
      select: {
        id: true,
        servicePackageId: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Elemento del combo no encontrado');
    }

    await this.prisma.servicePackageItem.delete({
      where: { id: itemId },
    });

    await this.recalculateTotals(existing.servicePackageId);

    return { success: true };
  }

  async listPublicPackages(
    businessId: string,
    query: ListServicePackagesQueryDto,
  ) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, status: true },
    });

    if (!business || business.status !== 'ACTIVE') {
      throw new NotFoundException('Negocio no encontrado');
    }

    const items = await this.prisma.servicePackage.findMany({
      where: {
        businessId,
        isActive: query.activeOnly === 'false' ? undefined : true,
      },
      orderBy: [{ createdAt: 'desc' }],
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
          include: {
            service: {
              select: {
                id: true,
                name: true,
                slug: true,
                durationMinutes: true,
                price: true,
                status: true,
              },
            },
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

  async toggleActive(businessId: string, packageId: string) {
    const item = await this.prisma.servicePackage.findFirst({
      where: {
        id: packageId,
        businessId,
      },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Combo no encontrado');
    }

    return this.prisma.servicePackage.update({
      where: { id: packageId },
      data: {
        isActive: !item.isActive,
      },
    });
  }

  async deletePackage(businessId: string, packageId: string) {
    const item = await this.prisma.servicePackage.findFirst({
      where: {
        id: packageId,
        businessId,
      },
      select: {
        id: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Combo no encontrado');
    }

    await this.prisma.servicePackage.delete({
      where: { id: packageId },
    });

    return { success: true };
  }
}