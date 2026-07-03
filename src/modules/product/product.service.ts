import {
  Injectable,
  NotFoundException,
  ConflictException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService implements OnModuleInit {
  // Inject TypeORM Repository để truy vấn bảng product trong PostgreSQL
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async onModuleInit() {
    const count = await this.productRepo.count();
    if (count === 0) {
      const defaultProducts = [
        {
          slug: 'pe',
          name: 'PE AI Health Camera Pro',
          price: 69.99,
          compareAtPrice: 99.00,
          images: ['https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&h=600&fit=crop&q=80'],
          description: 'Camera thông minh giám sát sức khỏe và hành vi thú cưng 24/7 bằng công nghệ AI đỉnh cao.',
          specs: {
            camera: [
              'Góc quan sát 130°',
              'Nhận dạng AI theo hành vi',
              'Phát hiện bất thường tự động',
              'Hoạt động ban đêm IR',
            ],
            connectivity: [
              'Wi-Fi 2.4 / 5 GHz',
              'Bluetooth 5.0 LE',
              'App iOS & Android',
            ],
            dimensions: [
              'Ø 82mm × H 95mm',
              'Đặt bàn hoặc gắn tường',
              'Cáp USB-C ẩn đáy đế',
            ],
            battery: [
              'Pin tích hợp 3200 mAh',
              '~7 ngày / lần sạc',
              'Sạc không dây Qi 10W',
            ],
          },
          stock: 100,
          isActive: true,
        },
        {
          slug: 'pe-lite',
          name: 'PE AI Health Camera Lite',
          price: 49.99,
          compareAtPrice: 69.00,
          images: ['https://images.unsplash.com/photo-1557429481-096-5bc77134f77c?w=600&h=600&fit=crop&q=80'],
          description: 'Phiên bản nhỏ gọn hỗ trợ quan sát Full HD 1080p và cảnh báo chuyển động thông minh.',
          specs: {
            camera: ['Độ phân giải 1080p', 'Góc rộng 110°', 'Cảm biến hồng ngoại ban đêm'],
            connectivity: ['Wi-Fi 2.4 GHz', 'App iOS & Android'],
            dimensions: ['Ø 60mm × H 80mm', 'Đế xoay 360° cơ học'],
            battery: ['Nguồn điện trực tiếp qua micro-USB'],
          },
          stock: 100,
          isActive: true,
        },
        {
          slug: 'pe-feeder',
          name: 'PE Smart Pet Feeder',
          price: 79.99,
          compareAtPrice: 119.00,
          images: ['https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&h=600&fit=crop&q=80'],
          description: 'Máy cho ăn tự động lên lịch ăn khoa học và điều khiển lượng hạt chính xác từ xa qua app.',
          specs: {
            capacity: ['Khay chứa hạt 4L chống ẩm', 'Phù hợp hạt size 2-12mm'],
            power: ['Nguồn cắm điện + Pin dự phòng D-cell'],
            connectivity: ['Wi-Fi 2.4 GHz', 'Loa và mic ghi âm giọng nói gọi ăn'],
          },
          stock: 100,
          isActive: true,
        },
        {
          slug: 'pe-fountain',
          name: 'PE Smart Water Fountain',
          price: 34.99,
          compareAtPrice: 49.00,
          images: ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=600&fit=crop&q=80'],
          description: 'Máy lọc nước tuần hoàn thông minh loại bỏ cặn bẩn, cung cấp nước sạch giàu oxy cho chó mèo.',
          specs: {
            filter: ['Màng lọc 3 lớp sợi bông + Than hoạt tính + Trao đổi ion'],
            capacity: ['Bình chứa 2L nước siêu yên tĩnh <20dB'],
            safety: ['Tự động ngắt nguồn khi thiếu nước'],
          },
          stock: 100,
          isActive: true,
        },
        {
          slug: 'pe-tracker',
          name: 'PE Smart GPS Tracker',
          price: 24.99,
          compareAtPrice: 39.00,
          images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=600&fit=crop&q=80'],
          description: 'Thiết bị định vị GPS siêu nhẹ đeo cổ thú cưng chống thất lạc, chống nước IP67.',
          specs: {
            tracking: ['Định vị thời gian thực GPS + BDS + LBS + Wi-Fi'],
            battery: ['Pin sạc dùng từ 5-7 ngày liên tục'],
            weight: ['Siêu nhẹ chỉ 28g gắn thoải mái vào vòng cổ'],
          },
          stock: 100,
          isActive: true,
        },
      ];

      for (const p of defaultProducts) {
        await this.productRepo.save(this.productRepo.create(p));
      }
      console.log('🌱 Đã seed 5 sản phẩm PE thành công vào database!');
    }
  }

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
