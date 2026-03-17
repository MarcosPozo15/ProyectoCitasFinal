import { BlockoutTargetType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateBlockoutDto {
  @IsEnum(BlockoutTargetType)
  targetType!: BlockoutTargetType;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;
}