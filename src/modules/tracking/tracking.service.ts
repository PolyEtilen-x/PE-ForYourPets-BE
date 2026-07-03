import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackingEvent } from './entities/tracking-event.entity';
import { CreateTrackingEventDto } from './dto/create-tracking-event.dto';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    @InjectRepository(TrackingEvent)
    private readonly eventRepo: Repository<TrackingEvent>,
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
}
