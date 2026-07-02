import { Injectable, Logger } from '@nestjs/common';
import { CreateTrackingEventDto } from './dto/create-tracking-event.dto';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);
  private readonly events: any[] = [];

  create(dto: CreateTrackingEventDto) {
    const event = {
      id: `evt_${Math.random().toString(36).substring(2, 9)}`,
      ...dto,
      receivedAt: new Date().toISOString(),
    };
    this.events.push(event);
    this.logger.log(`New tracking event received: ${dto.eventType} for camera ${dto.cameraId}`);
    return {
      success: true,
      message: 'Event logged successfully',
      event,
    };
  }

  findAll() {
    return this.events;
  }
}
