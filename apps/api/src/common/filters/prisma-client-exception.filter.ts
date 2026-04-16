import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, '');

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
          message: (exception.meta?.cause as string) || 'Record not found',
        });
        break;
      }
      case 'P2003': { // Foreign key constraint failed
        const status = HttpStatus.BAD_REQUEST;
        response.status(status).json({
          statusCode: status,
          message: `Foreign key constraint failed on the field: ${exception.meta?.field_name}`,
        });
        break;
      }
      default:
        // Fallback to default 500 error handled by BaseExceptionFilter
        super.catch(exception, host);
        break;
    }
  }
}
