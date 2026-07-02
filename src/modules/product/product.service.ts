import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ProductService {
  private readonly products = [
    {
      id: 'pe-camera',
      slug: 'pe',
      name: 'PE - For Your Pets - AI Health Camera',
      specs: {
        camera: ['Góc quan sát 130°', 'Nhận dạng AI theo hành vi', 'Phát hiện bất thường tự động', 'Hoạt động ban đêm IR'],
        connectivity: ['Wi-Fi 2.4 / 5 GHz', 'Bluetooth 5.0 LE', 'App iOS & Android'],
        dimensions: ['Ø 82mm × H 95mm', 'Đặt bàn hoặc gắn tường', 'Cáp USB-C ẩn đáy đế'],
        battery: ['Pin tích hợp 3200 mAh', '~7 ngày / lần sạc', 'Sạc không dây Qi 10W'],
      },
    },
  ];

  findAll() {
    return this.products;
  }

  findOneBySlug(slug: string) {
    const product = this.products.find((p) => p.slug === slug.toLowerCase());
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }
    return product;
  }
}
