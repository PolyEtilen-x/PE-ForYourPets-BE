import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { ProductModule } from './modules/product/product.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { OrderModule } from './modules/order/order.module';

@Module({
  imports: [
    // Đọc file .env và làm cho ConfigService dùng được ở toàn bộ app
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Kết nối PostgreSQL thông qua TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),

    // Rate limiting: mặc định 10 request/phút/IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),

    NewsletterModule,
    ProductModule,
    TrackingModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
