import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { OrderModule } from '../order/order.module';
import { NewsletterModule } from '../newsletter/newsletter.module';
import { ProductModule } from '../product/product.module';
import { TrackingModule } from '../tracking/tracking.module';

@Module({
  imports: [
    // Đăng ký JwtModule để có thể inject JwtService vào AdminService và AdminJwtGuard
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): any => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '8h'),
        },
      }),
    }),
    // Import các module khác để dùng service của chúng
    OrderModule,
    NewsletterModule,
    ProductModule,
    TrackingModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminJwtGuard],
})
export class AdminModule {}
