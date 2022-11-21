import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, min, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    minimum: 0,
    default: 10,
  })
  @IsOptional()
  @IsPositive()
  @IsInt()
  @Min(1)
  @Type(() => Number) // enableImplicitConversions:true
  limit?: number;

  @ApiProperty({
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number) // enableImplicitConversions:true
  page?: number;
}
