import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';

@Module({
  imports: [UsersModule],
  controllers: [VotesController],
  providers: [VotesService],
  exports: [VotesService],
})
export class VotesModule {}
