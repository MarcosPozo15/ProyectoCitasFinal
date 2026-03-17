import { IsBooleanString, IsOptional, IsString } from 'class-validator';

export class ListPromotionsQueryDto {
  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsBooleanString()
  activeOnly?: string;
}