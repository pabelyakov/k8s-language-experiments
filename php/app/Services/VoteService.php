<?php

namespace App\Services;

use App\Exceptions\ApiException;
use Illuminate\Support\Str;

class VoteService
{
    public function __construct(
        private readonly InMemoryStore $store,
        private readonly UserService $users,
        private readonly BeerCatalog $beers,
    ) {}

    /**
     * @return array{id: string, user_id: string, beer_id: int, beer_name: string, voted_at: string}
     */
    public function cast(string $userId, int $beerId): array
    {
        if (! $this->users->exists($userId)) {
            throw new ApiException(404, 'user not found');
        }

        $beer = $this->beers->findById($beerId);
        if ($beer === null) {
            throw new ApiException(400, 'beer_id must be one of the nominees (1..10)');
        }

        if ($this->store->hasVoteForUser($userId)) {
            throw new ApiException(409, 'user has already voted');
        }

        $vote = [
            'id' => (string) Str::uuid(),
            'user_id' => $userId,
            'beer_id' => $beer['id'],
            'voted_at' => now('UTC')->format('Y-m-d\TH:i:s.v\Z'),
        ];

        $this->store->putVote($vote);

        return [
            'id' => $vote['id'],
            'user_id' => $vote['user_id'],
            'beer_id' => $vote['beer_id'],
            'beer_name' => $beer['name'],
            'voted_at' => $vote['voted_at'],
        ];
    }

    /**
     * @return list<array{id: string, user_id: string, beer_id: int, voted_at: string}>
     */
    public function allVotes(): array
    {
        return $this->store->allVotes();
    }
}
