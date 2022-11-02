import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @IsInt()
  @Min(1)
  @Type(() => Number) // enableImplicitConversions:true
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number) // enableImplicitConversions:true
  page?: number;
}
