<?php

/**
 * FrankenPHP worker entrypoint.
 *
 * Boots Laravel once and handles many requests in-process so InMemoryStore
 * singletons persist. Use exactly one worker (see Dockerfile / README).
 */

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

ignore_user_abort(true);

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';

/** @var Kernel $kernel */
$kernel = $app->make(Kernel::class);

$handler = static function () use ($kernel): void {
    $request = Request::capture();
    $response = $kernel->handle($request);
    $response->send();
    $kernel->terminate($request, $response);
};

$maxRequests = (int) ($_SERVER['MAX_REQUESTS'] ?? 0);

for ($nbRequests = 0; ! $maxRequests || $nbRequests < $maxRequests; ++$nbRequests) {
    $keepRunning = \frankenphp_handle_request($handler);

    gc_collect_cycles();

    if (! $keepRunning) {
        break;
    }
}
