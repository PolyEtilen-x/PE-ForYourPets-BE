import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

// Trạng thái đơn hàng
export enum OrderStatus {
  PENDING = 'pending',       // Chờ xác nhận
  CONFIRMED = 'confirmed',   // Đã xác nhận
  SHIPPING = 'shipping',     // Đang giao
  DELIVERED = 'delivered',   // Đã giao thành công
  CANCELLED = 'cancelled',   // Đã hủy
}

// Phương thức thanh toán
export enum PaymentMethod {
  COD = 'cod',                     // Thanh toán khi nhận hàng
  BANK_TRANSFER = 'bank_transfer', // Chuyển khoản ngân hàng
}

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerName: string;

  @Column()
  customerEmail: string;

  @Column()
  customerPhone: string;

  @Column({ type: 'text' })
  shippingAddress: string;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  // Tổng tiền đơn hàng (VND)
  @Column({ type: 'int' })
  totalAmount: number;

  // Ghi chú của khách hàng
  @Column({ type: 'text', nullable: true })
  note: string;

  // Một đơn hàng có nhiều sản phẩm (OrderItem)
  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,     // Khi save Order thì tự save luôn các OrderItem
    eager: true,       // Khi query Order thì tự load luôn OrderItem, không cần join tay
  })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
