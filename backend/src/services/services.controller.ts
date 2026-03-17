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
import { CreateServiceDto } from './dto/create-service.dto';
import { ListServicesQueryDto } from './dto/list-services-query.dto';
import { ServicesService } from './services.service';

@Controller('businesses/:businessId/services')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async createService(
    @Param('businessId') businessId: string,
    @Body() dto: CreateServiceDto,
  ) {
    return this.servicesService.createService(businessId, dto);
  }

  @Get()
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async listServices(
    @Param('businessId') businessId: string,
    @Query() query: ListServicesQueryDto,
  ) {
    return this.servicesService.listServices(businessId, query);
  }

  @Patch(':serviceId/archive')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async archiveService(
    @Param('businessId') businessId: string,
    @Param('serviceId') serviceId: string,
  ) {
    return this.servicesService.archiveService(businessId, serviceId);
  }

  @Patch(':serviceId/activate')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async activateService(
    @Param('businessId') businessId: string,
    @Param('serviceId') serviceId: string,
  ) {
    return this.servicesService.activateService(businessId, serviceId);
  }
}