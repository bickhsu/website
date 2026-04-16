import {
  ArgumentsHost,
  Catch,
  HttpStatus,
  ExceptionFilter,
  Logger
} from '@nestjs/common';
import { Prisma } from '@prisma-client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case 'P2002': { // Unique constraint failed
        const status = HttpStatus.CONFLICT;
        response.status(status).json({
          statusCode: status,
          message: `Duplicate field error: ${exception.meta?.target}`,
          error: 'Conflict',
        });
        break;
      }
      case 'P2025': { // Record not found
        const status = HttpStatus.NOT_FOUND;
        response.status(status).json({
          statusCode: status,
          message: (exception.meta?.cause as string) || 'Database record not found',
          error: 'Not Found',
        });
        break;
      }
      case 'P2003': { // Foreign key constraint failed
        const status = HttpStatus.BAD_REQUEST;
        response.status(status).json({
          statusCode: status,
          message: `Foreign key constraint failed on the field: ${exception.meta?.field_name}`,
          error: 'Bad Request',
        });
        break;
      }
      default: {
        const status = HttpStatus.INTERNAL_SERVER_ERROR;

        this.logger.error(
          `[Prisma Error ${exception.code}] ${exception.message}`,
          exception.stack,
          PrismaClientExceptionFilter.name
        );
        response.status(status).json({
          statusCode: status,
          message: `A database error occurred while processing your request.`,
          error: 'Internal Server Error',
        });
        break;
      }
    }
  }
}
