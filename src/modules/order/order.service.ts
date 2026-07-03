import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  // Khách hàng tạo đơn hàng mới
  async create(dto: CreateOrderDto) {
    // Tính tổng tiền từ danh sách sản phẩm
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Tạo order object với tất cả thông tin từ DTO
    const order = this.orderRepo.create({
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
      shippingAddress: dto.shippingAddress,
      paymentMethod: dto.paymentMethod,
      note: dto.note,
      totalAmount,
      items: dto.items, // TypeORM sẽ tự tạo OrderItem nhờ cascade: true
    });

    return this.orderRepo.save(order);
  }

  // Khách hàng tra cứu đơn hàng theo ID
  async findOne(id: string) {
    const order = await this.orderRepo.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với ID: ${id}`);
    }

    return order;
  }

  // ---- Dùng nội bộ cho AdminService ----

  // Lấy tất cả đơn hàng với phân trang đơn giản
  findAll(page: number = 1, limit: number = 20) {
    return this.orderRepo.find({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  // Cập nhật trạng thái đơn hàng (admin)
  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.findOne(id);
    order.status = status;
    return this.orderRepo.save(order);
  }

  // Thống kê doanh thu và số đơn cho admin dashboard
  async getStats() {
    const total = await this.orderRepo.count();
    const delivered = await this.orderRepo.count({
      where: { status: OrderStatus.DELIVERED },
    });
    const pending = await this.orderRepo.count({
      where: { status: OrderStatus.PENDING },
    });

    // Tính tổng doanh thu từ các đơn đã giao thành công
    const result = await this.orderRepo
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'revenue')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .getRawOne<{ revenue: string }>();

    const revenue = Number(result?.revenue ?? 0);

    return { total, delivered, pending, revenue };
  }
}
