import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Đây là entity Product — TypeORM sẽ tự tạo bảng "product" trong PostgreSQL
@Entity('product')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Slug dùng trên URL, ví dụ: /products/pe-camera
  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Giá sản phẩm, lưu dạng số nguyên (VND hoặc USD)
  @Column({ type: 'float', default: 0 })
  price: number;

  @Column({ type: 'float', nullable: true })
  compareAtPrice?: number;

  // Danh sách URL ảnh, lưu dạng JSON array
  @Column({ type: 'json', default: [] })
  images: string[];

  // Thông số kỹ thuật, lưu dạng JSON object
  @Column({ type: 'json', nullable: true })
  specs: Record<string, string[]>;

  @Column({ type: 'int', default: 0 })
  stock: number;

  // isActive = false thì ẩn khỏi trang web (soft delete)
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
