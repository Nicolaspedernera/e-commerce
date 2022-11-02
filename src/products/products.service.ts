import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (err) {
      this.handleDBExceptions(err);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { page = 1, limit = 0 } = paginationDto;
      const skip = (page - 1) * limit;
      return await this.productRepository.find({
        order:{
          id:'ASC'
        },
        take:limit,
        skip:skip, 
      });
    } catch (err) {
      this.handleDBExceptions(err);
    }
  }

  async findOne(id: string) {
    const productFinded = await this.productRepository.findOne({
      where: { id: id },
    });
    if (!productFinded) {
      throw new NotFoundException(
        `The product with id: "${id}" does not exist.`,
      );
    }
    return productFinded;
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    try {
      await this.productRepository
        .createQueryBuilder()
        .delete()
        .from(Product)
        .where({ id: product.id })
        .execute();
      return { message: 'deleted', product };
    } catch (err) {
      this.handleDBExceptions(err);
    }
  }

  private handleDBExceptions(err: any) {
    if (err.code === '23505') {
      throw new BadRequestException(err.detail);
    }
    this.logger.error(err);
    throw new InternalServerErrorException(
      'Unexpected error,check server logs!',
    );
  }
}
