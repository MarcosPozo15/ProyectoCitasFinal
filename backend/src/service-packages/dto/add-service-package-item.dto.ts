import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AddServicePackageItemDto {
  @IsString()
  serviceId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}