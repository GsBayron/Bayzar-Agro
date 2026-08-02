<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RolValidoMiddleware
{
    private const ROLES_PERMITIDOS = [
        'Administrador',
        'Agricultor',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $usuario = $request->user();

        if (! $usuario) {
            return response()->json([
                'message' => 'No autenticado',
            ], 401);
        }

        if (! in_array($usuario->rol, self::ROLES_PERMITIDOS, true)) {
            return response()->json([
                'message' => 'El rol del usuario no es válido',
            ], 403);
        }

        return $next($request);
    }
}
