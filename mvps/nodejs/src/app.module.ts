import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { BeersModule } from './beers/beers.module';
import { UsersModule } from './users/users.module';
import { VotesModule } from './votes/votes.module';
import { ResultsModule } from './results/results.module';

@Module({
  imports: [HealthModule, BeersModule, UsersModule, VotesModule, ResultsModule],
})
export class AppModule {}
