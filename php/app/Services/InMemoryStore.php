<?php

namespace App\Services;

/**
 * Process-local store for users and votes (Laravel container singleton).
 *
 * Persists only while the PHP application stays resident — use FrankenPHP
 * worker mode with a single worker. PHP-FPM and `php artisan serve` rebuild
 * request state and will not keep votes/users across requests.
 */
class InMemoryStore
{
    /** @var array<string, array{id: string, name: string, created_at: string}> */
    private array $users = [];

    /** @var array<string, array{id: string, user_id: string, beer_id: int, voted_at: string}> */
    private array $votesById = [];

    /** @var array<string, string> user_id → vote_id */
    private array $voteIdByUserId = [];

    /**
     * @param  array{id: string, name: string, created_at: string}  $user
     */
    public function putUser(array $user): void
    {
        $this->users[$user['id']] = $user;
    }

    public function hasUser(string $id): bool
    {
        return isset($this->users[$id]);
    }

    /**
     * @return list<array{id: string, name: string, created_at: string}>
     */
    public function allUsers(): array
    {
        return array_values($this->users);
    }

    public function hasVoteForUser(string $userId): bool
    {
        return isset($this->voteIdByUserId[$userId]);
    }

    /**
     * @param  array{id: string, user_id: string, beer_id: int, voted_at: string}  $vote
     */
    public function putVote(array $vote): void
    {
        $this->voteIdByUserId[$vote['user_id']] = $vote['id'];
        $this->votesById[$vote['id']] = $vote;
    }

    /**
     * @return list<array{id: string, user_id: string, beer_id: int, voted_at: string}>
     */
    public function allVotes(): array
    {
        return array_values($this->votesById);
    }
}
