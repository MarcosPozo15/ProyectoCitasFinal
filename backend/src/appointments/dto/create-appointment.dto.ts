import { AppointmentSource } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  employeeId!: string;

  @IsString()
  serviceId!: string;

  @IsDateString()
  startsAt!: string;

  @IsEnum(AppointmentSource)
  source!: AppointmentSource;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  customerFirstName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  customerLastName!: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  customerPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  customerNotes?: string;
}