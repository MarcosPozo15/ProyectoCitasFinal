import { Weekday } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsString,
  Matches,
} from 'class-validator';

export class UpsertBusinessHoursDto {
  @IsEnum(Weekday)
  weekday!: Weekday;

  @IsBoolean()
  isOpen!: boolean;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime debe tener formato HH:mm',
  })
  startTime!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime debe tener formato HH:mm',
  })
  endTime!: string;
}