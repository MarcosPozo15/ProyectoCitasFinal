import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BlockoutTargetType,
  PlatformRole,
} from '@prisma/client';
import { BusinessAccessService } from '../common/services/business-access.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBlockoutDto } from './dto/create-blockout.dto';
import { UpsertBusinessHoursDto } from './dto/upsert-business-hours.dto';
import { UpsertEmployeeHoursDto } from './dto/upsert-employee-hours.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessAccessService: BusinessAccessService,
  ) {}

  async upsertBusinessHours(
    businessId: string,
    dto: UpsertBusinessHoursDto,
    actor: { userId: string; role: PlatformRole },
  ) {
    await this.businessAccessService.assertBusinessAccess({
      userId: actor.userId,
      role: actor.role,
      businessId,
    });

    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    return this.prisma.businessOpeningHour.upsert({
      where: {
        businessId_weekday: {
          businessId,
          weekday: dto.weekday,
        },
      },
      create: {
        businessId,
        weekday: dto.weekday,
        isOpen: dto.isOpen,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
      update: {
        isOpen: dto.isOpen,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });
  }

  async listBusinessHours(
    businessId: string,
    actor: { userId: string; role: PlatformRole },
  ) {
    await this.businessAccessService.assertBusinessAccess({
      userId: actor.userId,
      role: actor.role,
      businessId,
    });

    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    return this.prisma.businessOpeningHour.findMany({
      where: { businessId },
      orderBy: { weekday: 'asc' },
    });
  }

  async upsertEmployeeHours(
    businessId: string,
    employeeId: string,
    dto: UpsertEmployeeHoursDto,
    actor: { userId: string; role: PlatformRole },
  ) {
    await this.businessAccessService.assertBusinessAccess({
      userId: actor.userId,
      role: actor.role,
      businessId,
    });

    const employee = await this.prisma.employee.findFirst({
      where: {
        id: employeeId,
        businessId,
      },
      select: { id: true },
    });

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado en este negocio');
    }

    return this.prisma.employeeOpeningHour.upsert({
      where: {
        employeeId_weekday: {
          employeeId,
          weekday: dto.weekday,
        },
      },
      create: {
        businessId,
        employeeId,
        weekday: dto.weekday,
        isWorking: dto.isWorking,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
      update: {
        isWorking: dto.isWorking,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });
  }

  async listEmployeeHours(
    businessId: string,
    employeeId: string,
    actor: { userId: string; role: PlatformRole },
  ) {
    await this.businessAccessService.assertBusinessAccess({
      userId: actor.userId,
      role: actor.role,
      businessId,
    });

    const employee = await this.prisma.employee.findFirst({
      where: {
        id: employeeId,
        businessId,
      },
      select: { id: true },
    });

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado en este negocio');
    }

    return this.prisma.employeeOpeningHour.findMany({
      where: {
        businessId,
        employeeId,
      },
      orderBy: { weekday: 'asc' },
    });
  }

  async createBlockout(
    businessId: string,
    dto: CreateBlockoutDto,
    actor: { userId: string; role: PlatformRole },
  ) {
    await this.businessAccessService.assertBusinessAccess({
      userId: actor.userId,
      role: actor.role,
      businessId,
    });

    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new BadRequestException('Fechas inválidas');
    }

    if (endsAt <= startsAt) {
      throw new BadRequestException('endsAt debe ser posterior a startsAt');
    }

    if (dto.targetType === BlockoutTargetType.EMPLOYEE) {
      if (!dto.employeeId) {
        throw new BadRequestException(
          'employeeId es obligatorio para blockouts de empleado',
        );
      }

      const employee = await this.prisma.employee.findFirst({
        where: {
          id: dto.employeeId,
          businessId,
        },
        select: { id: true },
      });

      if (!employee) {
        throw new NotFoundException('Empleado no encontrado en este negocio');
      }
    }

    if (dto.targetType === BlockoutTargetType.BUSINESS && dto.employeeId) {
      throw new BadRequestException(
        'No debes enviar employeeId para blockouts de negocio',
      );
    }

    return this.prisma.blockout.create({
      data: {
        businessId,
        employeeId: dto.employeeId ?? null,
        targetType: dto.targetType,
        title: dto.title.trim(),
        description: dto.description?.trim(),
        startsAt,
        endsAt,
      },
    });
  }

  async listBlockouts(
    businessId: string,
    actor: { userId: string; role: PlatformRole },
    employeeId?: string,
  ) {
    await this.businessAccessService.assertBusinessAccess({
      userId: actor.userId,
      role: actor.role,
      businessId,
    });

    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    if (employeeId) {
      const employee = await this.prisma.employee.findFirst({
        where: {
          id: employeeId,
          businessId,
        },
        select: { id: true },
      });

      if (!employee) {
        throw new NotFoundException('Empleado no encontrado en este negocio');
      }
    }

    return this.prisma.blockout.findMany({
      where: {
        businessId,
        ...(employeeId ? { employeeId } : {}),
      },
      orderBy: {
        startsAt: 'asc',
      },
    });
  }

  async deleteBlockout(
    businessId: string,
    blockoutId: string,
    actor: { userId: string; role: PlatformRole },
  ) {
    await this.businessAccessService.assertBusinessAccess({
      userId: actor.userId,
      role: actor.role,
      businessId,
    });

    const blockout = await this.prisma.blockout.findFirst({
      where: {
        id: blockoutId,
        businessId,
      },
      select: { id: true },
    });

    if (!blockout) {
      throw new NotFoundException('Bloqueo no encontrado');
    }

    await this.prisma.blockout.delete({
      where: { id: blockoutId },
    });

    return { success: true };
  }
}