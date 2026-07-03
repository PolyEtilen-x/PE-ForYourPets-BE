import { IsEnum } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

// DTO dùng khi admin cập nhật trạng thái đơn hàng
export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message: `Trạng thái phải là một trong: ${Object.values(OrderStatus).join(', ')}`,
  })
  status: OrderStatus;
}
