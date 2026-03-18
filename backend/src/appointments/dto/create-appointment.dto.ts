import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AppointmentSource } from '@prisma/client';

export class CreateAppointmentDto {
  @IsString()
  employeeId!: string;

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsString()
  servicePackageId?: string;

  @IsDateString()
  startsAt!: string;

  @IsOptional()
  @IsEnum(AppointmentSource)
  source?: AppointmentSource;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  customerFirstName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  customerLastName!: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  customerNotes?: string;
}