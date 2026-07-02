import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];
    const expectedKey =
      this.configService.get<string>('API_KEY') || 'pe_secret_key_123';

    if (!apiKey || apiKey !== expectedKey) {
      throw new UnauthorizedException('Invalid API Key provided');
    }

    return true;
  }
}
