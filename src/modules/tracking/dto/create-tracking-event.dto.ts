import { IsString, IsNotEmpty, IsNumber, IsObject } from 'class-validator';

export class CreateTrackingEventDto {
  @IsNotEmpty()
  @IsString()
  cameraId: string;

  @IsNotEmpty()
  @IsString()
  eventType: string;

  @IsNotEmpty()
  @IsNumber()
  timestamp: number;

  @IsObject()
  details: Record<string, any>;
}
