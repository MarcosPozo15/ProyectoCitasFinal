import {
  Body,
  Controller,
  Get,
  Param,
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
}