import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
      });

      await this.productRepository.save(product);

      return { ...product, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { page = 1, limit = 0 } = paginationDto;
      const skip = (page - 1) * limit;
      const products = await this.productRepository.find({
        order: {
          id: 'ASC',
        },
        take: limit,
        skip: skip,
        relations: {
          images: true,
        },
      });
      return products.map(({ images, ...rest }) => ({
        ...rest,
        images: images.map((img) => img.url),
      }));
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
        .select('product')
        .from(Product, 'product')
        .where('UPPER(product.title) =:title', { title: term.toUpperCase() })
        .orWhere('product.slug =:slug', { slug: term.toLowerCase() })
        .leftJoinAndSelect('product.images', 'productImages')
        .getOne();
    }
    if (!product) {
      throw new NotFoundException(
        `The product with: "${term}" does not exist.`,
      );
    }
    return { ...product, images: product.images.map((image) => image.url) };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id: id,
      ...toUpdate,
    });

    if (!product) {
      throw new NotFoundException(`The product with id "${id}" not found.`);
    }

    //create queryRunner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
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
  async deleteAllProductsSeed() {
    try {
      await this.productRepository
        .createQueryBuilder()
        .delete()
        .from(Product)
        .where({})
        .execute();
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
