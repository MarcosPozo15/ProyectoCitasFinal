import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { AppointmentSource } from '@prisma/client';

export class CreateWaitlistEntryDto {
  @IsString()
  serviceId!: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsDateString()
  preferredDate!: string;

  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/)
  timeFrom?: string;

  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/)
  timeTo?: string;

  @IsString()
  @MinLength(2)
  customerFirstName!: string;

  @IsString()
  @MinLength(2)
  customerLastName!: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(AppointmentSource)
  source?: AppointmentSource;
}