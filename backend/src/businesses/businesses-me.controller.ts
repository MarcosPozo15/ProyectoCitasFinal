import { Controller, Get, UseGuards } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { BusinessesService } from './businesses.service';

@Controller('my-business')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BusinessesMeController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Get()
  @Roles(PlatformRole.BUSINESS_ADMIN)
  async getMyBusiness(@CurrentUser() user: AuthenticatedUser) {
    return this.businessesService.getBusinessByAdminUserId(user.sub);
  }
}