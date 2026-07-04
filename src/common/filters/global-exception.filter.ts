import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
import { Request, Response } from 'express';
import { TrackingService } from '../../modules/tracking/tracking.service';
import { LogSource } from '../../modules/tracking/entities/system-log.entity';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  constructor(private readonly trackingService: TrackingService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let stack = '';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resContent = exception.getResponse() as
        string | { message?: string | string[]; error?: string };

      if (typeof resContent === 'string') {
        message = resContent;
      } else {
        message = resContent.message || exception.message;
        errorCode = resContent.error || 'HTTP_EXCEPTION';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorCode = exception.name.toUpperCase();
      stack = exception.stack || '';
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
      );
    }

    // Ghi log vào CSDL bất đồng bộ, không chờ
    const stringMessage = Array.isArray(message) ? message[0] : message;
    this.trackingService
      .logSystemError(
        LogSource.BACKEND,
        `[${errorCode}] ${stringMessage}`,
        stack,
        request.url,
        {
          method: request.method,
          body: request.body,
          query: request.query,
          headers: request.headers,
        },
      )
      .catch((e) => {
        this.logger.error('Failed to log system error to DB', e);
      });

    response.status(status).json({
      success: false,
      message: Array.isArray(message) ? message[0] : message,
      errorCode,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
