import { IsDateString, IsString } from 'class-validator';

export class FindWaitlistMatchesDto {
  @IsString()
  serviceId!: string;

  @IsString()
  employeeId!: string;

  @IsDateString()
  startsAt!: string;
}