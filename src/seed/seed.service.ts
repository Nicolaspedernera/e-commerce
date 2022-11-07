import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';

@Injectable()
export class SeedService {
  constructor(private readonly productsService: ProductsService) {}
  async runSeed() {
    return await this.reBuildProducs();
  }

  private async reBuildProducs() {
    await this.productsService.deleteAllProductsSeed();
    return { message: 'All products deleted' };
  }
}
