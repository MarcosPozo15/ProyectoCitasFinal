import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { AvailabilityService } from './availability.service';
import { CreateBlockoutDto } from './dto/create-blockout.dto';
import { UpsertBusinessHoursDto } from './dto/upsert-business-hours.dto';
import { UpsertEmployeeHoursDto } from './dto/upsert-employee-hours.dto';

@Controller('businesses/:businessId')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post('opening-hours')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async upsertBusinessHours(
    @Param('businessId') businessId: string,
    @Body() dto: UpsertBusinessHoursDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.availabilityService.upsertBusinessHours(businessId, dto, {
      userId: user.sub,
      role: user.role,
    });
  }

  @Get('opening-hours')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async listBusinessHours(
    @Param('businessId') businessId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.availabilityService.listBusinessHours(businessId, {
      userId: user.sub,
      role: user.role,
    });
  }

  @Post('employees/:employeeId/opening-hours')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async upsertEmployeeHours(
    @Param('businessId') businessId: string,
    @Param('employeeId') employeeId: string,
    @Body() dto: UpsertEmployeeHoursDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.availabilityService.upsertEmployeeHours(
      businessId,
      employeeId,
      dto,
      {
        userId: user.sub,
        role: user.role,
      },
    );
  }

  @Get('employees/:employeeId/opening-hours')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async listEmployeeHours(
    @Param('businessId') businessId: string,
    @Param('employeeId') employeeId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.availabilityService.listEmployeeHours(
      businessId,
      employeeId,
      {
        userId: user.sub,
        role: user.role,
      },
    );
  }

  @Post('blockouts')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async createBlockout(
    @Param('businessId') businessId: string,
    @Body() dto: CreateBlockoutDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.availabilityService.createBlockout(businessId, dto, {
      userId: user.sub,
      role: user.role,
    });
  }

  @Get('blockouts')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async listBlockouts(
    @Param('businessId') businessId: string,
    @Query('employeeId') employeeId: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.availabilityService.listBlockouts(
      businessId,
      {
        userId: user.sub,
        role: user.role,
      },
      employeeId,
    );
  }

  @Delete('blockouts/:blockoutId')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async deleteBlockout(
    @Param('businessId') businessId: string,
    @Param('blockoutId') blockoutId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.availabilityService.deleteBlockout(businessId, blockoutId, {
      userId: user.sub,
      role: user.role,
    });
  }
}