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
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ListEmployeesQueryDto } from './dto/list-employees-query.dto';
import { EmployeesService } from './employees.service';

@Controller('businesses/:businessId/employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async createEmployee(
    @Param('businessId') businessId: string,
    @Body() dto: CreateEmployeeDto,
  ) {
    return this.employeesService.createEmployee(businessId, dto);
  }

  @Get()
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async listEmployees(
    @Param('businessId') businessId: string,
    @Query() query: ListEmployeesQueryDto,
  ) {
    return this.employeesService.listEmployees(businessId, query);
  }

  @Patch(':employeeId/deactivate')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async deactivateEmployee(
    @Param('businessId') businessId: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.employeesService.deactivateEmployee(businessId, employeeId);
  }

  @Patch(':employeeId/activate')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async activateEmployee(
    @Param('businessId') businessId: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.employeesService.activateEmployee(businessId, employeeId);
  }
}