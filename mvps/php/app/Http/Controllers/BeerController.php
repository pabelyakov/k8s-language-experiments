<?php

namespace App\Http\Controllers;

use App\Services\BeerCatalog;
use Illuminate\Http\JsonResponse;

class BeerController extends Controller
{
    public function __construct(
        private readonly BeerCatalog $catalog,
    ) {}

    public function index(): JsonResponse
    {
        $items = array_map(
            fn (array $beer): array => [
                'id' => $beer['id'],
                'name' => $beer['name'],
            ],
            $this->catalog->all(),
        );

        return response()->json(['items' => $items]);
    }
}
