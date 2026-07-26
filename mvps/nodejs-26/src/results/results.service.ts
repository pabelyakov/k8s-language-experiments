import { Injectable } from '@nestjs/common';
import { listBeersSortedById } from '../beers/beers.catalog';
import { VotesService } from '../votes/votes.service';

@Injectable()
export class ResultsService {
  constructor(private readonly votesService: VotesService) {}

  getResults() {
    const beers = listBeersSortedById();
    const counts = new Map<number, number>();
    for (const beer of beers) {
      counts.set(beer.id, 0);
    }

    const votes = this.votesService.allVotes();
    for (const vote of votes) {
      counts.set(vote.beer_id, (counts.get(vote.beer_id) ?? 0) + 1);
    }

    const total_votes = votes.length;

    const results = beers
      .map((beer) => {
        const voteCount = counts.get(beer.id) ?? 0;
        const share =
          total_votes === 0
            ? 0
            : Number((voteCount / total_votes).toFixed(4));

        return {
          beer_id: beer.id,
          beer_name: beer.name,
          votes: voteCount,
          share,
        };
      })
      .sort((a, b) => {
        if (b.votes !== a.votes) {
          return b.votes - a.votes;
        }
        return a.beer_id - b.beer_id;
      });

    return { total_votes, results };
  }
}
