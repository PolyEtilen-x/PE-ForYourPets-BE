import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class ChatbotQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @CreateDateColumn()
  createdAt: Date;
}
