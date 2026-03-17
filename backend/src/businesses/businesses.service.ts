import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BusinessStatus, PlatformRole, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { ListBusinessesQueryDto } from './dto/list-businesses-query.dto';

@Injectable()
export class BusinessesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async createBusiness(dto: CreateBusinessDto) {
    const normalizedSlug = dto.slug.toLowerCase().trim();
    const normalizedAdminEmail = dto.adminEmail.toLowerCase().trim();

    const existingBusiness = await this.prisma.business.findUnique({
      where: { slug: normalizedSlug },
    });

    if (existingBusiness) {
      throw new ConflictException('Ya existe un negocio con ese slug');
    }

    const existingAdmin =
      await this.usersService.findByEmail(normalizedAdminEmail);

    if (existingAdmin) {
      throw new ConflictException(
        'Ya existe un usuario con el email del admin principal',
      );
    }

    const adminUser = await this.usersService.createUser({
      email: normalizedAdminEmail,
      password: dto.adminPassword,
      firstName: dto.adminFirstName.trim(),
      lastName: dto.adminLastName.trim(),
      phone: dto.adminPhone?.trim(),
      role: PlatformRole.BUSINESS_ADMIN,
    });

    const business = await this.prisma.business.create({
      data: {
        name: dto.name.trim(),
        slug: normalizedSlug,
        legalName: dto.legalName?.trim(),
        taxId: dto.taxId?.trim(),
        email: dto.email?.toLowerCase().trim(),
        phone: dto.phone?.trim(),
        website: dto.website?.trim(),
        description: dto.description?.trim(),
        logoUrl: dto.logoUrl?.trim(),
        primaryColor: dto.primaryColor,
        secondaryColor: dto.secondaryColor,
        status: BusinessStatus.ACTIVE,
        timezone: dto.timezone?.trim() || 'Europe/Madrid',
        currency: dto.currency?.trim() || 'EUR',
        bookingCancellationHours: dto.bookingCancellationHours ?? 1,
        allowCustomerCancellation:
          dto.allowCustomerCancellation !== undefined
            ? dto.allowCustomerCancellation
            : true,
        depositPercentage: new Prisma.Decimal(dto.depositPercentage),
        addressLine1: dto.addressLine1?.trim(),
        addressLine2: dto.addressLine2?.trim(),
        city: dto.city?.trim(),
        postalCode: dto.postalCode?.trim(),
        country: dto.country?.trim(),
        adminUserId: adminUser.id,
      },
      include: {
        adminUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    return business;
  }

  async listBusinesses(query: ListBusinessesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const search = query.search?.trim();

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.business.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          adminUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              role: true,
              isActive: true,
            },
          },
        },
      }),
      this.prisma.business.count({ where }),
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

  async listPublicBusinesses(query: ListBusinessesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;
    const search = query.search?.trim();

    const where: Prisma.BusinessWhereInput = {
      status: BusinessStatus.ACTIVE,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { slug: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.business.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { createdAt: 'desc' },
          { name: 'asc' },
        ],
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          logoUrl: true,
          primaryColor: true,
          secondaryColor: true,
          city: true,
          country: true,
          phone: true,
          email: true,
          website: true,
          createdAt: true,
        },
      }),
      this.prisma.business.count({ where }),
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

  async getBusinessByAdminUserId(adminUserId: string) {
    const business = await this.prisma.business.findFirst({
      where: {
        adminUserId,
      },
      include: {
        adminUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!business) {
      throw new NotFoundException(
        'No se encontró un negocio asociado a este admin',
      );
    }

    return business;
  }
}