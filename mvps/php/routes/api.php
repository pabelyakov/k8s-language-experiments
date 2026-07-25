<?php

use App\Http\Controllers\BeerController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\ResultsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VoteController;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class);

Route::get('/v1/beers', [BeerController::class, 'index']);

Route::post('/v1/users', [UserController::class, 'store']);
Route::get('/v1/users', [UserController::class, 'index']);

Route::post('/v1/votes', [VoteController::class, 'store']);

Route::get('/v1/results', [ResultsController::class, 'index']);
