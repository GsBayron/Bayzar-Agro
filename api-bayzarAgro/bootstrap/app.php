<?php

use App\Http\Middleware\RolMiddleware;
use App\Http\Middleware\RolValidoMiddleware;
use App\Http\Middleware\SecurityHeadersMiddleware;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        $middleware->append(SecurityHeadersMiddleware::class);

        $middleware->alias([
            'rol' => RolMiddleware::class,
            'rol.valido' => RolValidoMiddleware::class,
        ]);
    })

    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (
            QueryException $exception,
            Request $request
        ) {
            if (! $request->isMethod('delete')) {
                return null;
            }

            $sqlState = $exception->errorInfo[0] ?? (string) $exception->getCode();

            if (! in_array($sqlState, ['23000', '23503'], true)) {
                return null;
            }

            return response()->json([
                'message' => 'No se puede eliminar el registro porque tiene datos relacionados',
            ], 409);
        });
    })->create();
