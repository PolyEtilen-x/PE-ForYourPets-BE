import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AskChatbotDto {
  @IsNotEmpty({ message: 'Tin nhắn không được để trống' })
  @IsString({ message: 'Tin nhắn phải là chuỗi ký tự' })
  @MaxLength(1000, { message: 'Tin nhắn tối đa 1000 ký tự' })
  message: string;
}
