import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ListEmployeesQueryDto } from './dto/list-employees-query.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async createEmployee(businessId: string, dto: CreateEmployeeDto) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    const employee = await this.prisma.employee.create({
      data: {
        businessId,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email: dto.email?.toLowerCase().trim(),
        phone: dto.phone?.trim(),
        jobTitle: dto.jobTitle?.trim(),
        bio: dto.bio?.trim(),
        colorHex: dto.colorHex,
        isBookable: dto.isBookable ?? true,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return employee;
  }

  async listEmployees(businessId: string, query: ListEmployeesQueryDto) {
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
              { firstName: { contains: search, mode: 'insensitive' as const } },
              { lastName: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
              { phone: { contains: search, mode: 'insensitive' as const } },
              { jobTitle: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.employee.count({ where }),
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