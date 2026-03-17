import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AppointmentsService } from './appointments.service';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { GetAvailabilityQueryDto } from './dto/get-availability-query.dto';
import { ListAppointmentsQueryDto } from './dto/list-appointments-query.dto';

@Controller('businesses/:businessId')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('employees/:employeeId/availability')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async getAvailability(
    @Param('businessId') businessId: string,
    @Param('employeeId') employeeId: string,
    @Query() query: GetAvailabilityQueryDto,
  ) {
    return this.appointmentsService.getAvailability(
      businessId,
      employeeId,
      query,
    );
  }

  @Post('appointments')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async createAppointment(
    @Param('businessId') businessId: string,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.createAppointment(businessId, dto);
  }

  @Get('appointments')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async listAppointments(
    @Param('businessId') businessId: string,
    @Query() query: ListAppointmentsQueryDto,
  ) {
    return this.appointmentsService.listAppointments(businessId, query);
  }

  @Patch('appointments/:appointmentId/cancel')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async cancelAppointment(
    @Param('businessId') businessId: string,
    @Param('appointmentId') appointmentId: string,
    @Body() dto: CancelAppointmentDto,
  ) {
    return this.appointmentsService.cancelAppointment(
      businessId,
      appointmentId,
      dto,
    );
  }
}