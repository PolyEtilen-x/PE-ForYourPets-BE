import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { CreateProductDto } from '../product/dto/create-product.dto';
import { UpdateProductDto } from '../product/dto/update-product.dto';
import { UpdateOrderStatusDto } from '../order/dto/update-order-status.dto';

// DTO đơn giản cho login admin
class AdminLoginDto {
  username: string;
  password: string;
}

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ========================
  // POST /admin/login — KHÔNG cần guard (đây là route đăng nhập)
  // ========================
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: AdminLoginDto) {
    return this.adminService.login(dto.username, dto.password);
  }

  // ========================
  // Tất cả routes bên dưới đều cần token (AdminJwtGuard)
  // ========================

  // GET /admin/dashboard — Xem tổng quan số liệu
  @UseGuards(AdminJwtGuard)
  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  // ===== QUẢN LÝ ĐƠN HÀNG =====

  // GET /admin/orders?page=1&limit=20 — Danh sách đơn hàng
  @UseGuards(AdminJwtGuard)
  @Get('orders')
  getOrders(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.adminService.getOrders(Number(page), Number(limit));
  }

  // PATCH /admin/orders/:id/status — Cập nhật trạng thái đơn hàng
  @UseGuards(AdminJwtGuard)
  @Patch('orders/:id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.adminService.updateOrderStatus(id, dto.status);
  }

  // ===== QUẢN LÝ NEWSLETTER =====

  // GET /admin/newsletters — Danh sách email đăng ký
  @UseGuards(AdminJwtGuard)
  @Get('newsletters')
  getNewsletterSubscribers() {
    return this.adminService.getNewsletterSubscribers();
  }

  // DELETE /admin/newsletters/:id — Hủy đăng ký một email
  @UseGuards(AdminJwtGuard)
  @Delete('newsletters/:id')
  removeNewsletterSubscriber(@Param('id') id: string) {
    return this.adminService.removeNewsletterSubscriber(id);
  }

  // ===== QUẢN LÝ SẢN PHẨM =====

  // GET /admin/products — Danh sách tất cả sản phẩm (kể cả đang ẩn)
  @UseGuards(AdminJwtGuard)
  @Get('products')
  getProducts() {
    return this.adminService.getProducts();
  }

  // POST /admin/products — Tạo sản phẩm mới
  @UseGuards(AdminJwtGuard)
  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.adminService.createProduct(dto);
  }

  // PATCH /admin/products/:id — Cập nhật sản phẩm
  @UseGuards(AdminJwtGuard)
  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.adminService.updateProduct(id, dto);
  }

  // DELETE /admin/products/:id — Ẩn sản phẩm (soft delete)
  @UseGuards(AdminJwtGuard)
  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }
}
