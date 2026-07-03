import { Injectable, Logger } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private orders: any[] = [];

  create(dto: CreateOrderDto) {
    const orderId = `PE-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = {
      orderId,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      ...dto,
    };

    this.orders.push(newOrder);

    this.logger.log(`[ORDER CREATED] ID: ${orderId} - Total: $${dto.total} - Customer: ${dto.name} (${dto.phone})`);
    
    return {
      success: true,
      message: 'Order created successfully',
      order: newOrder,
    };
  }
}
