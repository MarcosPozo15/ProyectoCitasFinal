import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { BusinessesService } from '../businesses/businesses.service';
import { CreateAppointmentDto } from '../appointments/dto/create-appointment.dto';
import { GetAvailabilityQueryDto } from '../appointments/dto/get-availability-query.dto';
import { CreateWaitlistEntryDto } from '../waitlist/dto/create-waitlist-entry.dto';
import { WaitlistService } from '../waitlist/waitlist.service';
import { ListBusinessesQueryDto } from '../businesses/dto/list-businesses-query.dto';
import { PromotionsService } from '../promotions/promotions.service';
import { ListPromotionsQueryDto } from '../promotions/dto/list-promotions-query.dto';

@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appointmentsService: AppointmentsService,
    private readonly businessesService: BusinessesService,
    private readonly waitlistService: WaitlistService,
    private readonly promotionsService: PromotionsService,
  ) {}

  async listPublicBusinesses(query: ListBusinessesQueryDto) {
    return this.businessesService.listPublicBusinesses(query);
  }

  async getBusinessBySlug(slug: string) {
    const business = await this.prisma.business.findFirst({
      where: {
        slug: slug.toLowerCase().trim(),
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        description: true,
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
        city: true,
        country: true,
        website: true,
        status: true,
        createdAt: true,
      },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    return business;
  }

  async listPublicEmployees(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, status: true },
    });

    if (!business || business.status !== 'ACTIVE') {
      throw new NotFoundException('Negocio no encontrado');
    }

    const items = await this.prisma.employee.findMany({
      where: {
        businessId,
        isBookable: true,
        status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        jobTitle: true,
        bio: true,
        colorHex: true,
        isBookable: true,
        createdAt: true,
      },
    });

    return {
      items,
      meta: {
        total: items.length,
        page: 1,
        limit: items.length || 1,
        totalPages: 1,
      },
    };
  }

  async listPublicServices(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, status: true },
    });

    if (!business || business.status !== 'ACTIVE') {
      throw new NotFoundException('Negocio no encontrado');
    }

    const items = await this.prisma.service.findMany({
      where: {
        businessId,
        status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      items,
      meta: {
        total: items.length,
        page: 1,
        limit: items.length || 1,
        totalPages: 1,
      },
    };
  }

  async listPublicPromotions(
    businessId: string,
    query: ListPromotionsQueryDto,
  ) {
    return this.promotionsService.listPublicActivePromotions(businessId, query);
  }

  async getPublicAvailability(
    businessId: string,
    employeeId: string,
    query: GetAvailabilityQueryDto,
  ) {
    return this.appointmentsService.getAvailability(
      businessId,
      employeeId,
      query,
    );
  }

  async createPublicAppointment(
    businessId: string,
    dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.createAppointment(businessId, dto);
  }

  async createPublicWaitlistEntry(
    businessId: string,
    dto: CreateWaitlistEntryDto,
  ) {
    return this.waitlistService.createEntry(businessId, {
      ...dto,
      source: dto.source ?? 'WEB',
    });
  }
}