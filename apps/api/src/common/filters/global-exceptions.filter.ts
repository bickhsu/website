import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] | object = 'Internal server error';
    let errorType: string = 'Internal Server Error';

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        message = (response as any).message || message;
        errorType = (response as any).error || errorType;
      } else {
        message = response;
      }
    }

    // Log the 500 error for tracking
    const method = ctx.getRequest<Request>().method;
    const url = ctx.getRequest<Request>().url;
    if (httpStatus >= 500) {
      const logMessage = exception instanceof Error ? exception.message : 'Unknown Error';
      const logStack = exception instanceof Error ? exception.stack : '';

      this.logger.error(`[${method} ${url}] ${httpStatus} ${logMessage}`, logStack);
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message,
      error: errorType,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
