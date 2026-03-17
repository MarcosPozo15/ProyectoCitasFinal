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
import { CreateWaitlistEntryDto } from './dto/create-waitlist-entry.dto';
import { FindWaitlistMatchesDto } from './dto/find-waitlist-matches.dto';
import { ListWaitlistQueryDto } from './dto/list-waitlist-query.dto';
import { WaitlistService } from './waitlist.service';

@Controller('businesses/:businessId/waitlist')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async createEntry(
    @Param('businessId') businessId: string,
    @Body() dto: CreateWaitlistEntryDto,
  ) {
    return this.waitlistService.createEntry(businessId, {
      ...dto,
      source: dto.source ?? 'MANUAL',
    });
  }

  @Get()
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async listEntries(
    @Param('businessId') businessId: string,
    @Query() query: ListWaitlistQueryDto,
  ) {
    return this.waitlistService.listEntries(businessId, query);
  }

  @Post('matches')
  @Roles(PlatformRole.SUPERADMIN, PlatformRole.BUSINESS_ADMIN)
  async findMatches(
    @Param('businessId') businessId: string,
    @Body() dto: FindWaitlistMatchesDto,
  ) {
    return this.waitlistService.findMatchesForSlot(businessId, dto);
  }
}