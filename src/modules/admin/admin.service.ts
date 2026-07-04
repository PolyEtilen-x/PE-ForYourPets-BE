import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OrderService } from '../order/order.service';
import { NewsletterService } from '../newsletter/newsletter.service';
import { ProductService } from '../product/product.service';
import { TrackingService } from '../tracking/tracking.service';
import { CreateProductDto } from '../product/dto/create-product.dto';
import { UpdateProductDto } from '../product/dto/update-product.dto';
import { OrderStatus } from '../order/entities/order.entity';

@Injectable()
export class AdminService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly orderService: OrderService,
    private readonly newsletterService: NewsletterService,
    private readonly productService: ProductService,
    private readonly trackingService: TrackingService,
  ) {}

  // ========================
  // Đăng nhập admin
  // ========================
  login(username: string, password: string) {
    const adminUsername = this.configService.get<string>('ADMIN_USERNAME');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    // So sánh với credentials trong .env
    if (username !== adminUsername || password !== adminPassword) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng.');
    }

    // Tạo JWT token với thông tin admin
    const secret = this.configService.get<string>('JWT_SECRET');
    const token = this.jwtService.sign({ username, role: 'admin' }, { secret });

    return {
      message: 'Đăng nhập thành công',
      token,
    };
  }

  // ========================
  // Dashboard
  // ========================
  async getDashboard() {
    // Lấy thống kê song song để tăng tốc độ phản hồi
    const [orderStats, totalSubscribers, totalProducts, totalTrackingEvents] =
      await Promise.all([
        this.orderService.getStats(),
        this.newsletterService.countActive(),
        this.productService.countActive(),
        this.trackingService.count(),
      ]);

    return {
      orders: orderStats,
      newsletter: { totalSubscribers },
      products: { totalActive: totalProducts },
      tracking: { totalEvents: totalTrackingEvents },
    };
  }

  // ========================
  // Quản lý đơn hàng
  // ========================
  getOrders(page: number, limit: number) {
    return this.orderService.findAll(page, limit);
  }

  updateOrderStatus(id: string, status: OrderStatus) {
    return this.orderService.updateStatus(id, status);
  }

  // ========================
  // Quản lý newsletter
  // ========================
  getNewsletterSubscribers() {
    return this.newsletterService.findAll();
  }

  removeNewsletterSubscriber(id: string) {
    return this.newsletterService.remove(id);
  }

  // ========================
  // Quản lý sản phẩm
  // ========================
  getProducts() {
    return this.productService.findAllForAdmin();
  }

  createProduct(dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  updateProduct(id: string, dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  deleteProduct(id: string) {
    return this.productService.softDelete(id);
  }

  // ========================
  // Hệ thống logs
  // ========================
  getSystemLogs(page: number, limit: number) {
    return this.trackingService.getSystemLogs(page, limit);
  }
}
