import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

// Bảng lưu danh sách email đã đăng ký newsletter
@Entity('newsletter_subscriber')
export class NewsletterSubscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  // isActive = false nếu admin xóa/hủy đăng ký
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  subscribedAt: Date;
}
