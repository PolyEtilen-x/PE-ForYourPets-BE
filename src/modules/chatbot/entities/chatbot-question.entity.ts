import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class ChatbotQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({ nullable: true })
  questionEn: string;

  @Column({ type: 'text', nullable: true })
  answerEn: string;

  @CreateDateColumn()
  createdAt: Date;
}
