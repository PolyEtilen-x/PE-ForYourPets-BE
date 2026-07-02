import { Controller, Get, Param } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productService.findOneBySlug(slug);
  }
}
