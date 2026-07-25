import { HttpException } from '@nestjs/common';

export class ApiException extends HttpException {
  constructor(status: number, message: string) {
    super({ error: message, status }, status);
  }
}
