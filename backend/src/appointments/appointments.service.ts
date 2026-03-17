import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AppointmentSource,
  AppointmentStatus,
  Prisma,
  Weekday,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { GetAvailabilityQueryDto } from './dto/get-availability-query.dto';
import { ListAppointmentsQueryDto } from './dto/list-appointments-query.dto';

type TimeRange = {
  start: Date;
  end: Date;
};

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private minutesToHHmm(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, '0');
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private hhmmToMinutes(value: string): number {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private weekdayFromDate(date: Date): Weekday {
    const day = date.getUTCDay();

    switch (day) {
      case 1:
        return Weekday.MONDAY;
      case 2:
        return Weekday.TUESDAY;
      case 3:
        return Weekday.WEDNESDAY;
      case 4:
        return Weekday.THURSDAY;
      case 5:
        return Weekday.FRIDAY;
      case 6:
        return Weekday.SATURDAY;
      default:
        return Weekday.SUNDAY;
    }
  }

  private rangesOverlap(a: TimeRange, b: TimeRange): boolean {
    return a.start < b.end && b.start < a.end;
  }

  private combineDateAndMinutes(date: Date, totalMinutes: number): Date {
    const result = new Date(date);
    result.setUTCHours(0, 0, 0, 0);
    result.setUTCMinutes(totalMinutes);
    return result;
  }

  private normalizeDateOnly(dateInput: string): Date {
    const date = new Date(dateInput);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Fecha inválida');
    }

    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  private async getBusinessAndEmployeeOrThrow(
    businessId: string,
    employeeId: string,
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: {
        id: employeeId,
        businessId,
      },
      include: {
        business: {
          select: {
            id: true,
            timezone: true,
            bookingCancellationHours: true,
            depositPercentage: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado en este negocio');
    }

    return employee;
  }

  private async getEmployeeServiceOrThrow(
    businessId: string,
    employeeId: string,
    serviceId: string,
  ) {
    const employeeService = await this.prisma.employeeService.findFirst({
      where: {
        employeeId,
        serviceId,
        employee: {
          businessId,
        },
        service: {
          businessId,
        },
      },
      include: {
        service: true,
      },
    });

    if (!employeeService) {
      throw new NotFoundException(
        'Ese servicio no está asignado a este empleado',
      );
    }

    return employeeService;
  }

  private async getDailyAvailabilityContext(
    businessId: string,
    employeeId: string,
    dateOnly: Date,
  ) {
    const weekday = this.weekdayFromDate(dateOnly);

    const [businessHours, employeeHours] = await Promise.all([
      this.prisma.businessOpeningHour.findUnique({
        where: {
          businessId_weekday: {
            businessId,
            weekday,
          },
        },
      }),
      this.prisma.employeeOpeningHour.findUnique({
        where: {
          employeeId_weekday: {
            employeeId,
            weekday,
          },
        },
      }),
    ]);

    return {
      weekday,
      businessHours,
      employeeHours,
    };
  }

  private async getDailyBusyRanges(
    businessId: string,
    employeeId: string,
    dateOnly: Date,
  ): Promise<TimeRange[]> {
    const dayStart = new Date(dateOnly);
    dayStart.setUTCHours(0, 0, 0, 0);

    const dayEnd = new Date(dateOnly);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const [blockouts, appointments] = await Promise.all([
      this.prisma.blockout.findMany({
        where: {
          businessId,
          OR: [
            {
              targetType: 'BUSINESS',
            },
            {
              targetType: 'EMPLOYEE',
              employeeId,
            },
          ],
          startsAt: {
            lt: dayEnd,
          },
          endsAt: {
            gt: dayStart,
          },
        },
      }),
      this.prisma.appointment.findMany({
        where: {
          businessId,
          employeeId,
          status: {
            in: [
              AppointmentStatus.PENDING,
              AppointmentStatus.CONFIRMED,
              AppointmentStatus.COMPLETED,
            ],
          },
          startsAt: {
            lt: dayEnd,
          },
          endsAt: {
            gt: dayStart,
          },
        },
      }),
    ]);

    return [
      ...blockouts.map((item) => ({
        start: item.startsAt,
        end: item.endsAt,
      })),
      ...appointments.map((item) => ({
        start: item.startsAt,
        end: item.endsAt,
      })),
    ];
  }

  async getAvailability(
    businessId: string,
    employeeId: string,
    query: GetAvailabilityQueryDto,
  ) {
    const dateOnly = this.normalizeDateOnly(query.date);

    const employee = await this.getBusinessAndEmployeeOrThrow(
      businessId,
      employeeId,
    );

    const employeeService = await this.getEmployeeServiceOrThrow(
      businessId,
      employeeId,
      query.serviceId,
    );

    const durationMinutes =
      employeeService.customDurationMin ??
      employeeService.service.durationMinutes;

    const { businessHours, employeeHours, weekday } =
      await this.getDailyAvailabilityContext(businessId, employeeId, dateOnly);

    if (!businessHours || !businessHours.isOpen) {
      return {
        businessId,
        employeeId,
        serviceId: query.serviceId,
        weekday,
        date: dateOnly.toISOString(),
        slots: [],
        reason: 'El negocio está cerrado ese día',
      };
    }

    if (!employeeHours || !employeeHours.isWorking || !employee.isBookable) {
      return {
        businessId,
        employeeId,
        serviceId: query.serviceId,
        weekday,
        date: dateOnly.toISOString(),
        slots: [],
        reason: 'El empleado no trabaja ese día',
      };
    }

    const businessStart = this.hhmmToMinutes(businessHours.startTime);
    const businessEnd = this.hhmmToMinutes(businessHours.endTime);
    const employeeStart = this.hhmmToMinutes(employeeHours.startTime);
    const employeeEnd = this.hhmmToMinutes(employeeHours.endTime);

    const dayStartMinutes = Math.max(businessStart, employeeStart);
    const dayEndMinutes = Math.min(businessEnd, employeeEnd);

    if (dayEndMinutes <= dayStartMinutes) {
      return {
        businessId,
        employeeId,
        serviceId: query.serviceId,
        weekday,
        date: dateOnly.toISOString(),
        slots: [],
        reason: 'No hay solape entre horario del negocio y del empleado',
      };
    }

    const busyRanges = await this.getDailyBusyRanges(
      businessId,
      employeeId,
      dateOnly,
    );

    const step = query.slotStepMinutes ?? 15;
    const slots: Array<{
      startsAt: string;
      endsAt: string;
      startTime: string;
      endTime: string;
    }> = [];

    for (
      let cursor = dayStartMinutes;
      cursor + durationMinutes <= dayEndMinutes;
      cursor += step
    ) {
      const slotStart = this.combineDateAndMinutes(dateOnly, cursor);
      const slotEnd = this.combineDateAndMinutes(
        dateOnly,
        cursor + durationMinutes,
      );

      const overlapsBusy = busyRanges.some((range) =>
        this.rangesOverlap(
          { start: slotStart, end: slotEnd },
          { start: range.start, end: range.end },
        ),
      );

      if (!overlapsBusy) {
        slots.push({
          startsAt: slotStart.toISOString(),
          endsAt: slotEnd.toISOString(),
          startTime: this.minutesToHHmm(cursor),
          endTime: this.minutesToHHmm(cursor + durationMinutes),
        });
      }
    }

    return {
      businessId,
      employeeId,
      serviceId: query.serviceId,
      weekday,
      date: dateOnly.toISOString(),
      durationMinutes,
      slots,
    };
  }

  async createAppointment(businessId: string, dto: CreateAppointmentDto) {
    const startsAt = new Date(dto.startsAt);

    if (Number.isNaN(startsAt.getTime())) {
      throw new BadRequestException('startsAt inválido');
    }

    const employee = await this.getBusinessAndEmployeeOrThrow(
      businessId,
      dto.employeeId,
    );

    const employeeService = await this.getEmployeeServiceOrThrow(
      businessId,
      dto.employeeId,
      dto.serviceId,
    );

    const durationMinutes =
      employeeService.customDurationMin ??
      employeeService.service.durationMinutes;

    const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);

    const dateOnly = new Date(
      Date.UTC(
        startsAt.getUTCFullYear(),
        startsAt.getUTCMonth(),
        startsAt.getUTCDate(),
      ),
    );

    const availability = await this.getAvailability(businessId, dto.employeeId, {
      serviceId: dto.serviceId,
      date: dateOnly.toISOString(),
      slotStepMinutes: 5,
    });

    const matchingSlot = availability.slots.find(
      (slot) => slot.startsAt === startsAt.toISOString(),
    );

    if (!matchingSlot) {
      throw new ConflictException(
        'No hay disponibilidad para esa hora con ese empleado y servicio',
      );
    }

    const normalizedEmail = dto.customerEmail?.toLowerCase().trim();
    const normalizedPhone = dto.customerPhone?.trim();

    let customer =
      normalizedEmail || normalizedPhone
        ? await this.prisma.customer.findFirst({
            where: {
              businessId,
              OR: [
                ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
                ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
              ],
            },
          })
        : null;

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          businessId,
          firstName: dto.customerFirstName.trim(),
          lastName: dto.customerLastName.trim(),
          email: normalizedEmail,
          phone: normalizedPhone,
          preferredChannel: dto.source,
          status: 'ACTIVE',
        },
      });
    }

    const depositPercentage = employeeService.service.requiresDeposit
      ? employeeService.service.depositPercentage ??
        employee.business.depositPercentage
      : null;

    const servicePrice =
      employeeService.customPrice ?? employeeService.service.price;

    const depositAmount =
      depositPercentage !== null
        ? new Prisma.Decimal(servicePrice).mul(depositPercentage).div(100)
        : null;

    return this.prisma.appointment.create({
      data: {
        businessId,
        customerId: customer.id,
        employeeId: dto.employeeId,
        serviceId: dto.serviceId,
        status: AppointmentStatus.CONFIRMED,
        source: dto.source ?? AppointmentSource.WEB,
        startsAt,
        endsAt,
        customerNotes: dto.customerNotes?.trim(),
        depositRequired: depositPercentage !== null,
        depositPercentage,
        depositAmount,
        confirmedAt: new Date(),
      },
      include: {
        customer: true,
        employee: true,
        service: true,
      },
    });
  }

  async listAppointments(businessId: string, query: ListAppointmentsQueryDto) {
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

    const where: Prisma.AppointmentWhereInput = {
      businessId,
      ...(query.employeeId ? { employeeId: query.employeeId } : {}),
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(query.serviceId ? { serviceId: query.serviceId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            startsAt: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          startsAt: 'asc',
        },
        include: {
          customer: true,
          employee: true,
          service: true,
        },
      }),
      this.prisma.appointment.count({ where }),
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
    async cancelAppointment(
    businessId: string,
    appointmentId: string,
    dto: { reason?: string },
  ) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        businessId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    if (
      appointment.status === AppointmentStatus.CANCELLED_BY_BUSINESS ||
      appointment.status === AppointmentStatus.CANCELLED_BY_CUSTOMER
    ) {
      throw new BadRequestException('La cita ya está cancelada');
    }

    if (
      appointment.status === AppointmentStatus.COMPLETED ||
      appointment.status === AppointmentStatus.NO_SHOW
    ) {
      throw new BadRequestException(
        'No se puede cancelar una cita ya cerrada',
      );
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.CANCELLED_BY_BUSINESS,
        cancelledAt: new Date(),
        cancellationReason:
          dto.reason?.trim() || 'Cancelada desde el panel interno',
      },
      include: {
        customer: true,
        employee: true,
        service: true,
      },
    });
  }
}
