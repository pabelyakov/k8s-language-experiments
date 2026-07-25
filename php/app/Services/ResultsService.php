<?php

namespace App\Services;

class ResultsService
{
    public function __construct(
        private readonly VoteService $votes,
        private readonly BeerCatalog $beers,
    ) {}

    /**
     * @return array{
     *     total_votes: int,
     *     results: list<array{beer_id: int, beer_name: string, votes: int, share: float}>
     * }
     */
    public function getResults(): array
    {
        $counts = [];
        foreach ($this->beers->all() as $beer) {
            $counts[$beer['id']] = 0;
        }

        $allVotes = $this->votes->allVotes();
        foreach ($allVotes as $vote) {
            $counts[$vote['beer_id']] = ($counts[$vote['beer_id']] ?? 0) + 1;
        }

        $totalVotes = count($allVotes);

        $results = [];
        foreach ($this->beers->all() as $beer) {
            $voteCount = $counts[$beer['id']];
            $share = $totalVotes === 0
                ? 0.0
                : round($voteCount / $totalVotes, 4);

            $results[] = [
                'beer_id' => $beer['id'],
                'beer_name' => $beer['name'],
                'votes' => $voteCount,
                'share' => $share,
            ];
        }

        usort($results, function (array $a, array $b): int {
            if ($a['votes'] !== $b['votes']) {
                return $b['votes'] <=> $a['votes'];
            }

            return $a['beer_id'] <=> $b['beer_id'];
        });

        return [
            'total_votes' => $totalVotes,
            'results' => $results,
        ];
    }
}
