import { IsEmail, IsNotEmpty } from 'class-validator';

export class SubscribeNewsletterDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}
