<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RolMiddleware
{
    public function handle(
        Request $request,
        Closure $next,
        string $rol
    ): Response {

        $usuario = $request->user();

        // Validar autenticación
        if (!$usuario) {

            return response()->json([
                'message' => 'No autenticado'
            ], 401);
        }

        // Validar rol
        if ($usuario->rol !== $rol) {

            return response()->json([
                'message' => 'No autorizado'
            ], 403);
        }

        return $next($request);
    }
}