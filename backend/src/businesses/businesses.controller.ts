import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { ListBusinessesQueryDto } from './dto/list-businesses-query.dto';

@Controller('businesses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  @Roles(PlatformRole.SUPERADMIN)
  async createBusiness(@Body() dto: CreateBusinessDto) {
    return this.businessesService.createBusiness(dto);
  }

  @Get()
  @Roles(PlatformRole.SUPERADMIN)
  async listBusinesses(@Query() query: ListBusinessesQueryDto) {
    return this.businessesService.listBusinesses(query);
  }
}