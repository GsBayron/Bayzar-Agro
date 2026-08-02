<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ApiRouteSecurityTest extends TestCase
{
    public function test_all_private_api_routes_require_api_authentication(): void
    {
        $publicRoutes = [
            'api/login',
            'api/public/planes',
            'api/registro',
        ];

        foreach (Route::getRoutes() as $route) {
            if (! str_starts_with($route->uri(), 'api/')) {
                continue;
            }

            if (in_array($route->uri(), $publicRoutes, true)) {
                continue;
            }

            $this->assertContains(
                'auth:api',
                $route->gatherMiddleware(),
                "La ruta {$route->uri()} debe utilizar auth:api."
            );
        }
    }

    public function test_catalog_mutations_require_administrator_role(): void
    {
        $catalogPrefixes = [
            'api/plaguicidas-registrados',
            'api/fertilizantes-registrados',
            'api/plagas-registradas',
        ];

        foreach (Route::getRoutes() as $route) {
            $isCatalogRoute = collect($catalogPrefixes)
                ->contains(fn (string $prefix) => str_starts_with(
                    $route->uri(),
                    $prefix
                ));

            $isMutation = count(array_intersect(
                $route->methods(),
                ['POST', 'PUT', 'PATCH', 'DELETE']
            )) > 0;

            if (! $isCatalogRoute || ! $isMutation) {
                continue;
            }

            $this->assertContains(
                'rol:Administrador',
                $route->gatherMiddleware(),
                "La ruta {$route->uri()} debe exigir rol Administrador."
            );
        }
    }
}
