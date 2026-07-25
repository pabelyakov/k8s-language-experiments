<?php

namespace App\Http\Controllers;

use App\Services\ResultsService;
use Illuminate\Http\JsonResponse;

class ResultsController extends Controller
{
    public function __construct(
        private readonly ResultsService $results,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json($this->results->getResults());
    }
}
