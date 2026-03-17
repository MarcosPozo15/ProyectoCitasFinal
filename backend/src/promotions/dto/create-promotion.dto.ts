import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PromotionType } from '@prisma/client';

export class CreatePromotionDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsEnum(PromotionType)
  type!: PromotionType;

  @Min(0)
  @Max(100000)
  value!: number;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}