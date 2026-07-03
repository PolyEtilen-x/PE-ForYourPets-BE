import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { AskChatbotDto } from './dto/ask-chatbot.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Get('questions')
  async getQuestions() {
    const list = await this.chatbotService.getSuggestedQuestions();
    return { success: true, questions: list };
  }

  @Post('ask')
  @HttpCode(HttpStatus.OK)
  async askQuestion(@Body() dto: AskChatbotDto) {
    const reply = await this.chatbotService.askQuestion(dto.message);
    return { success: true, reply };
  }
}
