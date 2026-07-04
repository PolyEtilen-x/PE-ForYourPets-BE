import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum LogSource {
  FRONTEND = 'FRONTEND',
  BACKEND = 'BACKEND',
  WEBHOOK = 'WEBHOOK',
}

@Entity('system_logs')
export class SystemLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: LogSource,
    default: LogSource.BACKEND,
  })
  source: LogSource;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  path: string;

  @Column({ type: 'json', nullable: true })
  payload: any;

  @Column({ type: 'text', nullable: true })
  stack: string;

  @CreateDateColumn()
  createdAt: Date;
}
