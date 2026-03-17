import {
  Body,
  Controller,
  Delete,
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
import { AddServicePackageItemDto } from './dto/add-service-package-item.dto';
import { CreateServicePackageDto } from './dto/create-service-package.dto';
import { ListServicePackagesQueryDto } from './dto/list-service-packages-query.dto';
import { ServicePackagesService } from './service-packages.service';

@Controller('businesses/:businessId/service-packages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServicePackagesController {
  constructor(
    private readonly servicePackagesService: ServicePackagesService,
  ) {}

  @Get()
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async listPackages(
    @Param('businessId') businessId: string,
    @Query() query: ListServicePackagesQueryDto,
  ) {
    return this.servicePackagesService.listPackages(businessId, query);
  }

  @Post()
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async createPackage(
    @Param('businessId') businessId: string,
    @Body() dto: CreateServicePackageDto,
  ) {
    return this.servicePackagesService.createPackage(businessId, dto);
  }

  @Get(':packageId')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async getPackageDetail(
    @Param('businessId') businessId: string,
    @Param('packageId') packageId: string,
  ) {
    return this.servicePackagesService.getPackageDetail(businessId, packageId);
  }

  @Post(':packageId/items')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async addItem(
    @Param('businessId') businessId: string,
    @Param('packageId') packageId: string,
    @Body() dto: AddServicePackageItemDto,
  ) {
    return this.servicePackagesService.addItem(businessId, packageId, dto);
  }

  @Delete(':packageId/items/:itemId')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async removeItem(
    @Param('businessId') businessId: string,
    @Param('packageId') packageId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.servicePackagesService.removeItem(
      businessId,
      packageId,
      itemId,
    );
  }

  @Patch(':packageId/toggle-active')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async toggleActive(
    @Param('businessId') businessId: string,
    @Param('packageId') packageId: string,
  ) {
    return this.servicePackagesService.toggleActive(businessId, packageId);
  }

  @Delete(':packageId')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async deletePackage(
    @Param('businessId') businessId: string,
    @Param('packageId') packageId: string,
  ) {
    return this.servicePackagesService.deletePackage(businessId, packageId);
  }
}