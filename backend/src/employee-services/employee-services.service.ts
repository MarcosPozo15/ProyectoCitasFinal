import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignServiceDto } from './dto/assign-service.dto';

@Injectable()
export class EmployeeServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async assignService(
    businessId: string,
    employeeId: string,
    dto: AssignServiceDto,
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: {
        id: employeeId,
        businessId,
      },
      select: {
        id: true,
        businessId: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado en este negocio');
    }

    const service = await this.prisma.service.findFirst({
      where: {
        id: dto.serviceId,
        businessId,
      },
      select: {
        id: true,
        businessId: true,
        name: true,
        slug: true,
        durationMinutes: true,
        price: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado en este negocio');
    }

    const existingAssignment = await this.prisma.employeeService.findFirst({
      where: {
        employeeId,
        serviceId: dto.serviceId,
      },
      select: { id: true },
    });

    if (existingAssignment) {
      throw new ConflictException(
        'Ese servicio ya está asignado a este empleado',
      );
    }

    const assignment = await this.prisma.employeeService.create({
      data: {
        employeeId,
        serviceId: dto.serviceId,
        customDurationMin: dto.customDurationMin,
        customPrice:
          dto.customPrice !== undefined
            ? new Prisma.Decimal(dto.customPrice)
            : null,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            isBookable: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            slug: true,
            durationMinutes: true,
            price: true,
            status: true,
            requiresDeposit: true,
            depositPercentage: true,
          },
        },
      },
    });

    return assignment;
  }

  async listAssignments(businessId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: {
        id: employeeId,
        businessId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado en este negocio');
    }

    const items = await this.prisma.employeeService.findMany({
      where: {
        employeeId,
        employee: {
          businessId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            durationMinutes: true,
            price: true,
            status: true,
            requiresDeposit: true,
            depositPercentage: true,
          },
        },
      },
    });

    return {
      employee,
      items,
      meta: {
        total: items.length,
      },
    };
  }
}