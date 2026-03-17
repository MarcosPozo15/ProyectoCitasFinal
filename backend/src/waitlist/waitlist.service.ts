import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentSource, Prisma, WaitlistStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWaitlistEntryDto } from './dto/create-waitlist-entry.dto';
import { FindWaitlistMatchesDto } from './dto/find-waitlist-matches.dto';
import { ListWaitlistQueryDto } from './dto/list-waitlist-query.dto';

@Injectable()
export class WaitlistService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeDateOnly(dateInput: string): Date {
    const date = new Date(dateInput);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Fecha inválida');
    }

    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  private hhmmToMinutes(value: string): number {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private isoToHHmm(value: string): string {
    const date = new Date(value);
    const hours = `${date.getUTCHours()}`.padStart(2, '0');
    const minutes = `${date.getUTCMinutes()}`.padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private sameUtcDay(a: Date, b: Date): boolean {
    return (
      a.getUTCFullYear() === b.getUTCFullYear() &&
      a.getUTCMonth() === b.getUTCMonth() &&
      a.getUTCDate() === b.getUTCDate()
    );
  }

  private async assertBusinessActive(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, status: true, name: true },
    });

    if (!business || business.status !== 'ACTIVE') {
      throw new NotFoundException('Negocio no encontrado');
    }

    return business;
  }

  private async assertServiceInBusiness(businessId: string, serviceId: string) {
    const service = await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        businessId,
        status: 'ACTIVE',
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

  private async assertEmployeeInBusiness(
    businessId: string,
    employeeId?: string,
    serviceId?: string,
  ) {
    if (!employeeId) return null;

    const employee = await this.prisma.employee.findFirst({
      where: {
        id: employeeId,
        businessId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        isBookable: true,
      },
    });

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado en este negocio');
    }

    if (!employee.isBookable) {
      throw new BadRequestException('El empleado no está disponible para reserva');
    }

    if (serviceId) {
      const assignment = await this.prisma.employeeService.findFirst({
        where: {
          employeeId,
          serviceId,
        },
        select: { id: true },
      });

      if (!assignment) {
        throw new BadRequestException(
          'Ese servicio no está asignado a ese empleado',
        );
      }
    }

    return employee;
  }

  async createEntry(businessId: string, dto: CreateWaitlistEntryDto) {
    await this.assertBusinessActive(businessId);
    await this.assertServiceInBusiness(businessId, dto.serviceId);
    await this.assertEmployeeInBusiness(
      businessId,
      dto.employeeId,
      dto.serviceId,
    );

    const preferredDate = this.normalizeDateOnly(dto.preferredDate);

    if (dto.timeFrom && dto.timeTo) {
      if (this.hhmmToMinutes(dto.timeFrom) >= this.hhmmToMinutes(dto.timeTo)) {
        throw new BadRequestException('La franja horaria es inválida');
      }
    }

    const customerEmail = dto.customerEmail?.trim().toLowerCase();
    const customerPhone = dto.customerPhone?.trim();

    return this.prisma.waitlistEntry.create({
      data: {
        businessId,
        serviceId: dto.serviceId,
        employeeId: dto.employeeId,
        preferredDate,
        timeFrom: dto.timeFrom,
        timeTo: dto.timeTo,
        customerFirstName: dto.customerFirstName.trim(),
        customerLastName: dto.customerLastName.trim(),
        customerEmail,
        customerPhone,
        notes: dto.notes?.trim(),
        source: dto.source ?? AppointmentSource.WEB,
        status: WaitlistStatus.ACTIVE,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async listEntries(businessId: string, query: ListWaitlistQueryDto) {
    await this.assertBusinessActive(businessId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.WaitlistEntryWhereInput = {
      businessId,
      ...(query.serviceId ? { serviceId: query.serviceId } : {}),
      ...(query.employeeId ? { employeeId: query.employeeId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.preferredDate
        ? {
            preferredDate: this.normalizeDateOnly(query.preferredDate),
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.waitlistEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'asc' }],
        include: {
          service: {
            select: {
              id: true,
              name: true,
            },
          },
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.waitlistEntry.count({ where }),
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

  async findMatchesForSlot(businessId: string, dto: FindWaitlistMatchesDto) {
    await this.assertBusinessActive(businessId);
    await this.assertServiceInBusiness(businessId, dto.serviceId);
    await this.assertEmployeeInBusiness(
      businessId,
      dto.employeeId,
      dto.serviceId,
    );

    const slotStart = new Date(dto.startsAt);

    if (Number.isNaN(slotStart.getTime())) {
      throw new BadRequestException('startsAt inválido');
    }

    const slotDateOnly = new Date(
      Date.UTC(
        slotStart.getUTCFullYear(),
        slotStart.getUTCMonth(),
        slotStart.getUTCDate(),
      ),
    );

    const slotTime = this.isoToHHmm(dto.startsAt);
    const slotMinutes = this.hhmmToMinutes(slotTime);

    const candidates = await this.prisma.waitlistEntry.findMany({
      where: {
        businessId,
        serviceId: dto.serviceId,
        status: WaitlistStatus.ACTIVE,
        preferredDate: slotDateOnly,
        OR: [{ employeeId: null }, { employeeId: dto.employeeId }],
      },
      orderBy: [{ createdAt: 'asc' }],
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const matches = candidates
      .filter((entry) => this.sameUtcDay(entry.preferredDate, slotDateOnly))
      .filter((entry) => {
        if (!entry.timeFrom && !entry.timeTo) {
          return true;
        }

        const fromMinutes = entry.timeFrom
          ? this.hhmmToMinutes(entry.timeFrom)
          : 0;
        const toMinutes = entry.timeTo
          ? this.hhmmToMinutes(entry.timeTo)
          : 24 * 60;

        return slotMinutes >= fromMinutes && slotMinutes <= toMinutes;
      })
      .map((entry) => {
        let score = 0;

        if (entry.employeeId === dto.employeeId) {
          score += 50;
        }

        if (!entry.timeFrom && !entry.timeTo) {
          score += 10;
        } else {
          score += 25;
        }

        const ageMs = Date.now() - new Date(entry.createdAt).getTime();
        const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
        score += Math.min(ageHours, 20);

        return {
          ...entry,
          matchScore: score,
          slot: {
            startsAt: slotStart.toISOString(),
            startTime: slotTime,
          },
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore || +new Date(a.createdAt) - +new Date(b.createdAt));

    return {
      businessId,
      serviceId: dto.serviceId,
      employeeId: dto.employeeId,
      startsAt: slotStart.toISOString(),
      items: matches,
      meta: {
        total: matches.length,
      },
    };
  }
}