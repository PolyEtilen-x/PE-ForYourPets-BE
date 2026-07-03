import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotQuestion } from './entities/chatbot-question.entity';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChatbotQuestion])],
  controllers: [ChatbotController],
  providers: [ChatbotService],
  exports: [ChatbotService],
})
export class ChatbotModule {}
