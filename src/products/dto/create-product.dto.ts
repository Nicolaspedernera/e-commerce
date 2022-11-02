import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'The title must be a String.' })
  @MinLength(1, { message: 'The title must have a least one character.' })
  title: string;

  @IsNumber()
  @IsPositive({ message: 'The price must be positive.' })
  @IsOptional()
  price?: number;

  @IsString({ message: 'The description must be a String.' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'The slug must be a String.' })
  @IsOptional()
  slug?: string;

  @IsInt({ message: 'The stock must be a integer.' })
  @IsPositive()
  @IsOptional()
  stock?: number;

  @IsString({ each: true, message: 'All the sizes have to be a String.' })
  @IsArray()
  sizes: string[];

  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;
}
