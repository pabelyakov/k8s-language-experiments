<?php

namespace App\Services;

use Illuminate\Support\Str;

class UserService
{
    public function __construct(
        private readonly InMemoryStore $store,
    ) {}

    /**
     * @return array{id: string, name: string, created_at: string}
     */
    public function create(string $name): array
    {
        $user = [
            'id' => (string) Str::uuid(),
            'name' => $name,
            'created_at' => now('UTC')->format('Y-m-d\TH:i:s.v\Z'),
        ];

        $this->store->putUser($user);

        return $user;
    }

    public function exists(string $id): bool
    {
        return $this->store->hasUser($id);
    }

    /**
     * @return array{
     *     items: list<array{id: string, name: string, created_at: string}>,
     *     page: int,
     *     page_size: int,
     *     total: int,
     *     total_pages: int
     * }
     */
    public function list(int $page, int $pageSize, string $sort, string $order): array
    {
        $users = $this->store->allUsers();

        usort($users, function (array $a, array $b) use ($sort, $order): int {
            $result = match ($sort) {
                'name' => strcasecmp($a['name'], $b['name']) ?: strcmp($a['id'], $b['id']),
                'id' => strcmp($a['id'], $b['id']),
                default => strcmp($a['created_at'], $b['created_at']) ?: strcmp($a['id'], $b['id']),
            };

            return $order === 'desc' ? -$result : $result;
        });

        $total = count($users);
        $totalPages = $total === 0 ? 0 : (int) ceil($total / $pageSize);
        $offset = min(($page - 1) * $pageSize, $total);
        $items = array_slice($users, $offset, $pageSize);

        return [
            'items' => array_values($items),
            'page' => $page,
            'page_size' => $pageSize,
            'total' => $total,
            'total_pages' => $totalPages,
        ];
    }
}
