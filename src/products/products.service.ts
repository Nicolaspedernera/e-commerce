import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { QueryBuilder, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid';
import { SubscriptionLog } from 'rxjs/internal/testing/SubscriptionLog';
import { title } from 'process';
import { basename } from 'path';

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
        order: {
          id: 'ASC',
        },
        take: limit,
        skip: skip,
      });
    } catch (err) {
      this.handleDBExceptions(err);
    }
  }

  async findOne(term: string) {
    let product: Product;
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const query = this.productRepository.createQueryBuilder();
      product = await query
        // .where('UPPER(title) =:title or slug =:slug', {
        //   title: term.toUpperCase(),
        //   slug: term.toLowerCase(),
        // })
        .select('product')
        .from(Product, 'product')
        .where('UPPER(product.title) =:title', { title: term.toUpperCase() })
        .orWhere('product.slug =:slug', { slug: term.toLowerCase() })
        .getOne();
    }
    if (!product) {
      throw new NotFoundException(
        `The product with: "${term}" does not exist.`,
      );
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
    });
    if (!product) {
      throw new NotFoundException(`The product with id "${id}" not found.`);
    }
    try {
      await this.productRepository.save(product);
      return { message: 'Updated', product };
    } catch (err) {
      this.handleDBExceptions(err);
    }
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
