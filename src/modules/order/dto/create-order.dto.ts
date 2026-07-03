import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/order.entity';

// DTO cho từng sản phẩm trong đơn hàng
class OrderItemDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsString()
  productName: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

// DTO cho toàn bộ đơn hàng
export class CreateOrderDto {
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString()
  customerName: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  customerEmail: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString()
  customerPhone: string;

  @IsNotEmpty({ message: 'Địa chỉ giao hàng không được để trống' })
  @IsString()
  shippingAddress: string;

  @IsEnum(PaymentMethod, {
    message: 'Phương thức thanh toán phải là cod hoặc bank_transfer',
  })
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  note?: string;

  // Danh sách sản phẩm, phải có ít nhất 1 sản phẩm
  @IsArray()
  @ArrayMinSize(1, { message: 'Đơn hàng phải có ít nhất 1 sản phẩm' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
