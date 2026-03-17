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
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { ListPromotionsQueryDto } from './dto/list-promotions-query.dto';
import { PromotionsService } from './promotions.service';

@Controller('businesses/:businessId/promotions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async createPromotion(
    @Param('businessId') businessId: string,
    @Body() dto: CreatePromotionDto,
  ) {
    return this.promotionsService.createPromotion(businessId, dto);
  }

  @Get()
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async listPromotions(
    @Param('businessId') businessId: string,
    @Query() query: ListPromotionsQueryDto,
  ) {
    return this.promotionsService.listPromotions(businessId, query);
  }

  @Patch(':promotionId/toggle-active')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async toggleActive(
    @Param('businessId') businessId: string,
    @Param('promotionId') promotionId: string,
  ) {
    return this.promotionsService.toggleActive(businessId, promotionId);
  }

  @Delete(':promotionId')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async deletePromotion(
    @Param('businessId') businessId: string,
    @Param('promotionId') promotionId: string,
  ) {
    return this.promotionsService.deletePromotion(businessId, promotionId);
  }
}