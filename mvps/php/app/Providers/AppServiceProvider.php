<?php

namespace App\Providers;

use App\Services\BeerCatalog;
use App\Services\InMemoryStore;
use App\Services\ResultsService;
use App\Services\UserService;
use App\Services\VoteService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(InMemoryStore::class);
        $this->app->singleton(BeerCatalog::class);
        $this->app->singleton(UserService::class);
        $this->app->singleton(VoteService::class);
        $this->app->singleton(ResultsService::class);
    }

    public function boot(): void
    {
        //
    }
}
