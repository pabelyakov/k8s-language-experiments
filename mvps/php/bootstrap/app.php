<?php

use App\Exceptions\ApiException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        apiPrefix: '',
        commands: __DIR__.'/../routes/console.php',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // No auth / rate limiting — keep load tests unblocked.
        $middleware->group('api', [
            SubstituteBindings::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(fn () => true);

        $exceptions->render(function (ApiException $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'status' => $e->status,
            ], $e->status);
        });

        $exceptions->render(function (ValidationException $e) {
            return response()->json([
                'error' => $e->validator->errors()->first() ?: 'validation failed',
                'status' => 400,
            ], 400);
        });

        $exceptions->render(function (HttpExceptionInterface $e, Request $request) {
            return response()->json([
                'error' => $e->getMessage() !== '' ? $e->getMessage() : 'request error',
                'status' => $e->getStatusCode(),
            ], $e->getStatusCode());
        });
    })->create();
