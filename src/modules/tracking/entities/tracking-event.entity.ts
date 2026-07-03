import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

// Bảng lưu tracking events từ camera PE
@Entity('tracking_event')
export class TrackingEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cameraId: string;

  @Column()
  eventType: string;

  // Timestamp từ camera (Unix milliseconds)
  @Column({ type: 'bigint' })
  timestamp: number;

  // Dữ liệu chi tiết của event, lưu dạng JSON
  @Column({ type: 'json', nullable: true })
  details: Record<string, unknown>;

  @CreateDateColumn()
  receivedAt: Date;
}
