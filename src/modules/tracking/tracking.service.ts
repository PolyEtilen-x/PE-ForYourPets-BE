import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackingEvent } from './entities/tracking-event.entity';
import { SystemLog, LogSource } from './entities/system-log.entity';
import { CreateTrackingEventDto } from './dto/create-tracking-event.dto';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    @InjectRepository(TrackingEvent)
    private readonly eventRepo: Repository<TrackingEvent>,
    @InjectRepository(SystemLog)
    private readonly systemLogRepo: Repository<SystemLog>,
  ) {}

  // Nhận tracking event từ camera và lưu vào DB
  async create(dto: CreateTrackingEventDto) {
    const event = this.eventRepo.create({
      cameraId: dto.cameraId,
      eventType: dto.eventType,
      timestamp: dto.timestamp,
      details: dto.details,
    });

    const saved = await this.eventRepo.save(event);
    this.logger.log(
      `New tracking event: ${dto.eventType} from camera ${dto.cameraId}`,
    );

    return { success: true, message: 'Event logged successfully', event: saved };
  }

  // Lấy tất cả events (chỉ admin dùng)
  findAll() {
    return this.eventRepo.find({ order: { receivedAt: 'DESC' } });
  }

  // Đếm tổng số events (dùng cho admin dashboard)
  count() {
    return this.eventRepo.count();
  }

  // ==== LOGGING HỆ THỐNG ====

  async logSystemError(source: LogSource, message: string, stack?: string, path?: string, payload?: any) {
    try {
      const log = this.systemLogRepo.create({
        source,
        message,
        stack,
        path,
        payload,
      });
      await this.systemLogRepo.save(log);
    } catch (e) {
      this.logger.error('Cannot save system log: ', e);
    }
  }

  async getSystemLogs(page: number = 1, limit: number = 50) {
    return this.systemLogRepo.find({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
