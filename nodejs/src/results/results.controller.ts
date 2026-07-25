import { Controller, Get } from '@nestjs/common';
import { ResultsService } from './results.service';

@Controller('v1/results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get()
  getResults() {
    return this.resultsService.getResults();
  }
}
