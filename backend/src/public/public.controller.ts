import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PublicService } from './public.service';
import { GetAvailabilityQueryDto } from '../appointments/dto/get-availability-query.dto';
import { CreateAppointmentDto } from '../appointments/dto/create-appointment.dto';
import { CreateWaitlistEntryDto } from '../waitlist/dto/create-waitlist-entry.dto';
import { ListBusinessesQueryDto } from '../businesses/dto/list-businesses-query.dto';
import { ListPromotionsQueryDto } from '../promotions/dto/list-promotions-query.dto';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('businesses')
  async listBusinesses(@Query() query: ListBusinessesQueryDto) {
    return this.publicService.listPublicBusinesses(query);
  }

  @Get('businesses/:slug')
  async getBusinessBySlug(@Param('slug') slug: string) {
    return this.publicService.getBusinessBySlug(slug);
  }

  @Get('businesses/:businessId/employees')
  async listEmployees(@Param('businessId') businessId: string) {
    return this.publicService.listPublicEmployees(businessId);
  }

  @Get('businesses/:businessId/services')
  async listServices(@Param('businessId') businessId: string) {
    return this.publicService.listPublicServices(businessId);
  }

  @Get('businesses/:businessId/promotions')
  async listPromotions(
    @Param('businessId') businessId: string,
    @Query() query: ListPromotionsQueryDto,
  ) {
    return this.publicService.listPublicPromotions(businessId, query);
  }

  @Get('businesses/:businessId/employees/:employeeId/availability')
  async getAvailability(
    @Param('businessId') businessId: string,
    @Param('employeeId') employeeId: string,
    @Query() query: GetAvailabilityQueryDto,
  ) {
    return this.publicService.getPublicAvailability(
      businessId,
      employeeId,
      query,
    );
  }

  @Post('businesses/:businessId/appointments')
  async createAppointment(
    @Param('businessId') businessId: string,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.publicService.createPublicAppointment(businessId, dto);
  }

  @Post('businesses/:businessId/waitlist')
  async createWaitlistEntry(
    @Param('businessId') businessId: string,
    @Body() dto: CreateWaitlistEntryDto,
  ) {
    return this.publicService.createPublicWaitlistEntry(businessId, dto);
  }
}