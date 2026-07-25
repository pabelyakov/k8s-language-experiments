import { Module } from '@nestjs/common';
import { VotesModule } from '../votes/votes.module';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';

@Module({
  imports: [VotesModule],
  controllers: [ResultsController],
  providers: [ResultsService],
})
export class ResultsModule {}
