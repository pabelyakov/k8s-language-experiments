<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateVoteRequest;
use App\Services\VoteService;
use Illuminate\Http\JsonResponse;

class VoteController extends Controller
{
    public function __construct(
        private readonly VoteService $votes,
    ) {}

    public function store(CreateVoteRequest $request): JsonResponse
    {
        $data = $request->validated();
        $vote = $this->votes->cast($data['user_id'], (int) $data['beer_id']);

        return response()->json($vote, 201);
    }
}
