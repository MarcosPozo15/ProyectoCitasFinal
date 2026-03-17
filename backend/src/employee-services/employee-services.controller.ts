import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AssignServiceDto } from './dto/assign-service.dto';
import { EmployeeServicesService } from './employee-services.service';

@Controller('businesses/:businessId/employees/:employeeId/services')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeServicesController {
  constructor(
    private readonly employeeServicesService: EmployeeServicesService,
  ) {}

  @Post()
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async assignService(
    @Param('businessId') businessId: string,
    @Param('employeeId') employeeId: string,
    @Body() dto: AssignServiceDto,
  ) {
    return this.employeeServicesService.assignService(
      businessId,
      employeeId,
      dto,
    );
  }

  @Get()
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async listAssignments(
    @Param('businessId') businessId: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.employeeServicesService.listAssignments(
      businessId,
      employeeId,
    );
  }
}