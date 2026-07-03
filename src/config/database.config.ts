import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

// Hàm này trả về config cho TypeORM dựa trên các biến môi trường trong .env
export function getDatabaseConfig(
  configService: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5434),
    username: configService.get<string>('DB_USER', 'pe_user'),
    password: configService.get<string>('DB_PASS', 'pe_password'),
    database: configService.get<string>('DB_NAME', 'pe_foryourpets_db'),

    // Tự động tìm các file entity trong toàn bộ project
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],

    // synchronize: true -> TypeORM tự tạo/cập nhật bảng dựa trên entity
    // CHỈ dùng ở môi trường development, production phải dùng migrations!
    synchronize: configService.get<string>('NODE_ENV') !== 'production',

    logging: configService.get<string>('NODE_ENV') === 'development',
  };
}
