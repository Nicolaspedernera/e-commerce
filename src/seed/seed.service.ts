import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly productsService: ProductsService) {}
  async runSeed() {
    return await this.rebuildProducts();
  }

  private async rebuildProducts() {
    await this.productsService.deleteAllProductsSeed();

    const seedProducts = initialData.products;

    const insertPromises = [];

    seedProducts.forEach((product) => {
      insertPromises.push(this.productsService.create(product));
    });

    const result = await Promise.all(insertPromises);

    return {message:'Success', result};

    return { message: 'All products deleted' };
  }
}
