import { IsNotEmpty, IsEmail, IsString, IsArray, IsNumber, IsEnum } from 'class-validator';

export enum PaymentMethod {
  COD = 'COD',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export class OrderItemDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}

export class CreateOrderDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Phone is required' })
  @IsString()
  phone: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Address is required' })
  @IsString()
  address: string;

  @IsNotEmpty({ message: 'Payment method is required' })
  @IsEnum(PaymentMethod, { message: 'Payment method must be COD or BANK_TRANSFER' })
  paymentMethod: PaymentMethod;

  @IsNotEmpty()
  @IsArray()
  items: OrderItemDto[];

  @IsNotEmpty()
  @IsNumber()
  total: number;
}
