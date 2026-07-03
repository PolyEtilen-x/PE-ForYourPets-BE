import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  // Đăng ký Product entity để TypeORM tạo bảng và inject Repository
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductController],
  providers: [ProductService],
  // Export ProductService để AdminModule có thể dùng
  exports: [ProductService],
})
export class ProductModule {}
