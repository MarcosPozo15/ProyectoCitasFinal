import { IsOptional, IsString } from 'class-validator';

export class ListServicePackagesQueryDto {
  @IsOptional()
  @IsString()
  activeOnly?: string;
}
