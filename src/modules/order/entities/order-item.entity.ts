import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';

// Bảng lưu từng sản phẩm trong đơn hàng
@Entity('order_item')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Quan hệ nhiều-một: nhiều OrderItem thuộc về 1 Order
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  // Lưu lại productId để có thể tra cứu sau
  @Column()
  productId: string;

  // Lưu tên sản phẩm tại thời điểm đặt hàng (phòng trường hợp sản phẩm bị đổi tên sau)
  @Column()
  productName: string;

  @Column()
  quantity: number;

  // Giá tại thời điểm đặt hàng (không phụ thuộc vào giá sản phẩm thay đổi sau này)
  @Column({ type: 'float' })
  price: number;
}
