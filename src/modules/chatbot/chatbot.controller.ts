import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { AskChatbotDto } from './dto/ask-chatbot.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Get('questions')
  async getQuestions(@Query('locale') locale?: string) {
    const list = await this.chatbotService.getSuggestedQuestions(locale || 'vi');
    return { success: true, questions: list };
  }

  @Post('ask')
  @HttpCode(HttpStatus.OK)
  async askQuestion(
    @Body() dto: AskChatbotDto,
    @Query('locale') locale?: string,
  ) {
    const reply = await this.chatbotService.askQuestion(dto.message, locale || 'vi');
    return { success: true, reply };
  }
}
