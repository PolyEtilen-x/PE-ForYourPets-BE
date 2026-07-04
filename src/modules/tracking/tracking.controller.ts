import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { TrackingService } from './tracking.service';
import { CreateTrackingEventDto } from './dto/create-tracking-event.dto';
import { LogSource } from './entities/system-log.entity';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  // POST /tracking/events — Webhook từ camera bắn dữ liệu về
  @UseGuards(ApiKeyGuard)
  @Post('event')
  create(@Body() dto: CreateTrackingEventDto) {
    return this.trackingService.create(dto);
  }

  // POST /tracking/error — Frontend gửi log lỗi lên
  @Post('error')
  logFrontendError(@Body() body: any) {
    const { message, stack, path, payload } = body;
    return this.trackingService.logSystemError(
      LogSource.FRONTEND,
      message || 'Unknown frontend error',
      stack,
      path,
      payload,
    );
  }
}
