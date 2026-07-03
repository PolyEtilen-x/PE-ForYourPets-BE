import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  // Inject TypeORM Repository để truy vấn bảng product trong PostgreSQL
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // Lấy tất cả sản phẩm đang active (hiển thị trên trang web)
  findAll() {
    return this.productRepo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  // Lấy thông tin 1 sản phẩm theo slug (dùng cho trang chi tiết sản phẩm)
  async findOneBySlug(slug: string) {
    const product = await this.productRepo.findOne({
      where: { slug: slug.toLowerCase(), isActive: true },
    });

    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với slug: ${slug}`);
    }

    return product;
  }

  // Lấy sản phẩm theo ID (dùng trong admin)
  async findOneById(id: string) {
    const product = await this.productRepo.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID: ${id}`);
    }

    return product;
  }

  // Tạo sản phẩm mới (chỉ admin dùng)
  async create(dto: CreateProductDto) {
    // Kiểm tra slug có bị trùng không
    const existing = await this.productRepo.findOne({
      where: { slug: dto.slug.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException(`Slug "${dto.slug}" đã tồn tại`);
    }

    const product = this.productRepo.create({
      ...dto,
      slug: dto.slug.toLowerCase(),
    });

    return this.productRepo.save(product);
  }

  // Cập nhật thông tin sản phẩm (chỉ admin dùng)
  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findOneById(id);

    // Gán các giá trị mới vào product object rồi lưu lại
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  // Xóa mềm sản phẩm: đặt isActive = false thay vì xóa khỏi DB
  async softDelete(id: string) {
    const product = await this.findOneById(id);
    product.isActive = false;
    await this.productRepo.save(product);
    return { message: `Đã ẩn sản phẩm "${product.name}"` };
  }

  // ---- Dùng nội bộ cho AdminService ----

  // Lấy tất cả sản phẩm kể cả đã ẩn (admin view)
  findAllForAdmin() {
    return this.productRepo.find({ order: { createdAt: 'DESC' } });
  }

  // Đếm tổng số sản phẩm đang active
  countActive() {
    return this.productRepo.count({ where: { isActive: true } });
  }
}
