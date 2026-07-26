import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ApiException } from '../common/exceptions/api.exception';
import { findBeerById } from '../beers/beers.catalog';
import { UsersService } from '../users/users.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { Vote } from './vote.entity';

@Injectable()
export class VotesService {
  private readonly votesById = new Map<string, Vote>();
  /** Ensures one vote per user (userId → voteId). */
  private readonly voteIdByUserId = new Map<string, string>();

  constructor(private readonly usersService: UsersService) {}

  cast(dto: CreateVoteDto) {
    if (!this.usersService.exists(dto.user_id)) {
      throw new ApiException(404, 'user not found');
    }

    const beer = findBeerById(dto.beer_id);
    if (!beer) {
      throw new ApiException(400, 'beer_id must be one of the nominees (1..10)');
    }

    if (this.voteIdByUserId.has(dto.user_id)) {
      throw new ApiException(409, 'user has already voted');
    }

    const voteId = randomUUID();
    const vote: Vote = {
      id: voteId,
      user_id: dto.user_id,
      beer_id: beer.id,
      voted_at: new Date().toISOString(),
    };

    this.voteIdByUserId.set(dto.user_id, voteId);
    this.votesById.set(voteId, vote);

    return {
      id: vote.id,
      user_id: vote.user_id,
      beer_id: vote.beer_id,
      beer_name: beer.name,
      voted_at: vote.voted_at,
    };
  }

  allVotes(): Vote[] {
    return [...this.votesById.values()];
  }
}
