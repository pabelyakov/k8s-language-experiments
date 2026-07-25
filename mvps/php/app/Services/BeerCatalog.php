<?php

namespace App\Services;

class BeerCatalog
{
    /** @var list<array{id: int, name: string}> */
    private array $beers;

    /** @var array<int, array{id: int, name: string}> */
    private array $byId;

    public function __construct()
    {
        /** @var list<array{id: int, name: string}> $beers */
        $beers = config('beers');
        usort($beers, fn (array $a, array $b): int => $a['id'] <=> $b['id']);

        $this->beers = $beers;
        $this->byId = [];
        foreach ($beers as $beer) {
            $this->byId[$beer['id']] = $beer;
        }
    }

    /**
     * @return list<array{id: int, name: string}>
     */
    public function all(): array
    {
        return $this->beers;
    }

    /**
     * @return array{id: int, name: string}|null
     */
    public function findById(int $id): ?array
    {
        return $this->byId[$id] ?? null;
    }

    public function exists(int $id): bool
    {
        return isset($this->byId[$id]);
    }
}
