import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { TrackingService } from './tracking.service';
import { CreateTrackingEventDto } from './dto/create-tracking-event.dto';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @UseGuards(ApiKeyGuard)
  @Post('event')
  create(@Body() dto: CreateTrackingEventDto) {
    return this.trackingService.create(dto);
  }
}
