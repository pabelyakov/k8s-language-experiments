import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorBody {
  error: string;
  status: number;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const body = this.toErrorBody(exception);
    response.status(body.status).json(body);
  }

  private toErrorBody(exception: unknown): ErrorBody {
    if (exception instanceof BadRequestException) {
      const payload = exception.getResponse();
      const message = this.extractValidationMessage(payload);
      return { error: message, status: HttpStatus.BAD_REQUEST };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'object' && payload !== null && 'error' in payload) {
        const err = (payload as { error?: unknown; status?: unknown }).error;
        const msg = typeof err === 'string' ? err : exception.message;
        return { error: msg, status };
      }

      if (typeof payload === 'string') {
        return { error: payload, status };
      }

      return { error: exception.message || 'Error', status };
    }

    return {
      error: exception instanceof Error ? exception.message : 'Internal server error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }

  private extractValidationMessage(payload: string | object): string {
    if (typeof payload === 'string') {
      return payload;
    }

    const messages = (payload as { message?: string | string[] }).message;
    if (Array.isArray(messages) && messages.length > 0) {
      return messages[0];
    }
    if (typeof messages === 'string') {
      return messages;
    }

    return 'Bad request';
  }
}
