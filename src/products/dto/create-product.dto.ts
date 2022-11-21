import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    type: 'String',
    minimum: 1,
  })
  @IsString({ message: 'The title must be a String.' })
  @MinLength(1, { message: 'The title must have a least one character.' })
  title: string;

  @ApiProperty({
    type: 'int',
  })
  @IsNumber()
  @IsPositive({ message: 'The price must be positive.' })
  @IsOptional()
  price?: number;

  @ApiProperty({
    type: 'String',
  })
  @IsString({ message: 'The description must be a String.' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: 'String',
  })
  @IsString({ message: 'The slug must be a String.' })
  @IsOptional()
  slug?: string;

  @ApiProperty({
    type: 'int',
  })
  @IsInt({ message: 'The stock must be a integer.' })
  @IsPositive()
  @IsOptional()
  stock?: number;

  @ApiProperty({
    description: 'Strings of arrays',
    type: [String],
  })
  @IsString({ each: true, message: 'All the sizes must be a String.' })
  @IsArray()
  sizes: string[];

  @ApiProperty({
    type: [String],
  })
  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;

  @ApiProperty({
    type: 'String',
  })
  @IsString({ each: true, message: 'All the tags must be a String' })
  @IsArray()
  @IsOptional()
  tags: string[];

  @ApiProperty({
    description: 'Strings of arrays',
    type: [String],
  })
  // @IsUrl()
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images: string[];
}
