import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class AssignServiceDto {
  @IsString()
  serviceId!: string;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(1440)
  customDurationMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  customPrice?: number;
}