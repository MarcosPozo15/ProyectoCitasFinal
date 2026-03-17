import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GetAvailabilityQueryDto {
  @IsString()
  serviceId!: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(5)
  @Max(120)
  slotStepMinutes: number = 15;
}