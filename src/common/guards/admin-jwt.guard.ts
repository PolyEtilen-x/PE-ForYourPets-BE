import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

// Guard bảo vệ các route /admin/*
// Cách dùng: thêm @UseGuards(AdminJwtGuard) vào controller hoặc từng route
@Injectable()
export class AdminJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Đọc token từ header: Authorization: Bearer <token>
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bạn cần đăng nhập để truy cập trang admin.');
    }

    const token = authHeader.split(' ')[1];

    try {
      // Xác minh token hợp lệ và chưa hết hạn
      const secret = this.configService.get<string>('JWT_SECRET');
      this.jwtService.verify(token, { secret });
      return true;
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn.');
    }
  }
}
