import { Injectable, NotFoundException } from '@nestjs/common';

export interface ProductData {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  description: string;
  specs?: Record<string, string[]>;
}

@Injectable()
export class ProductService {
  private readonly products: ProductData[] = [
    {
      id: 'pe-camera',
      slug: 'pe',
      name: 'PE AI Health Camera Pro',
      price: 69.99,
      compareAtPrice: 99.00,
      image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&h=600&fit=crop&q=80',
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
    },
    {
      id: 'pe-camera-lite',
      slug: 'pe-lite',
      name: 'PE AI Health Camera Lite',
      price: 49.99,
      compareAtPrice: 69.00,
      image: 'https://images.unsplash.com/photo-1557429481-096-5bc77134f77c?w=600&h=600&fit=crop&q=80',
      description: 'Phiên bản nhỏ gọn hỗ trợ quan sát Full HD 1080p và cảnh báo chuyển động thông minh.',
      specs: {
        camera: ['Độ phân giải 1080p', 'Góc rộng 110°', 'Cảm biến hồng ngoại ban đêm'],
        connectivity: ['Wi-Fi 2.4 GHz', 'App iOS & Android'],
        dimensions: ['Ø 60mm × H 80mm', 'Đế xoay 360° cơ học'],
        battery: ['Nguồn điện trực tiếp qua micro-USB'],
      },
    },
    {
      id: 'pe-feeder',
      slug: 'pe-feeder',
      name: 'PE Smart Pet Feeder',
      price: 79.99,
      compareAtPrice: 119.00,
      image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&h=600&fit=crop&q=80',
      description: 'Máy cho ăn tự động lên lịch ăn khoa học và điều khiển lượng hạt chính xác từ xa qua app.',
      specs: {
        capacity: ['Khay chứa hạt 4L chống ẩm', 'Phù hợp hạt size 2-12mm'],
        power: ['Nguồn cắm điện + Pin dự phòng D-cell'],
        connectivity: ['Wi-Fi 2.4 GHz', 'Loa và mic ghi âm giọng nói gọi ăn'],
      },
    },
    {
      id: 'pe-fountain',
      slug: 'pe-fountain',
      name: 'PE Smart Water Fountain',
      price: 34.99,
      compareAtPrice: 49.00,
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=600&fit=crop&q=80',
      description: 'Máy lọc nước tuần hoàn thông minh loại bỏ cặn bẩn, cung cấp nước sạch giàu oxy cho chó mèo.',
      specs: {
        filter: ['Màng lọc 3 lớp sợi bông + Than hoạt tính + Trao đổi ion'],
        capacity: ['Bình chứa 2L nước siêu yên tĩnh <20dB'],
        safety: ['Tự động ngắt nguồn khi thiếu nước'],
      },
    },
    {
      id: 'pe-tracker',
      slug: 'pe-tracker',
      name: 'PE Smart GPS Tracker',
      price: 24.99,
      compareAtPrice: 39.00,
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=600&fit=crop&q=80',
      description: 'Thiết bị định vị GPS siêu nhẹ đeo cổ thú cưng chống thất lạc, chống nước IP67.',
      specs: {
        tracking: ['Định vị thời gian thực GPS + BDS + LBS + Wi-Fi'],
        battery: ['Pin sạc dùng từ 5-7 ngày liên tục'],
        weight: ['Siêu nhẹ chỉ 28g gắn thoải mái vào vòng cổ'],
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
