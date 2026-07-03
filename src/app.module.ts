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
import { AdminModule } from './modules/admin/admin.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),

    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),

    NewsletterModule,
    ProductModule,
    TrackingModule,
    OrderModule,
    AdminModule,
    ChatbotModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
