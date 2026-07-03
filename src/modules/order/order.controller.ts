import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

// Các endpoint này không cần đăng nhập — khách hàng dùng tự do
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // POST /orders — Khách hàng đặt hàng
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.orderService.create(dto);
  }

  // GET /orders/:id — Khách hàng tra cứu đơn hàng của mình
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }
}
