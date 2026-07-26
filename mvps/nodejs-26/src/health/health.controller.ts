import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'beer-vote',
      runtime: 'nodejs-26-nestjs',
    };
  }
}
