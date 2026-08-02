<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Passport\Passport;
use Tests\TestCase;

class SecurityConfigurationTest extends TestCase
{
    use RefreshDatabase;

    public function test_passport_token_lifetimes_are_explicitly_configured(): void
    {
        $this->assertSame(1, Passport::tokensExpireIn()->d);
        $this->assertSame(30, Passport::refreshTokensExpireIn()->d);
        $this->assertSame(1, Passport::personalAccessTokensExpireIn()->d);
    }

    public function test_api_responses_include_security_headers(): void
    {
        Passport::actingAs($this->crearAgricultor());

        $this->getJson('/api/dashboard')
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->assertHeader('Cache-Control', 'no-store, private')
            ->assertHeader(
                'Content-Security-Policy',
                "default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
            );
    }

    public function test_cors_allows_only_the_configured_frontend_origin(): void
    {
        config(['cors.allowed_origins' => [
            'https://frontend.example.test',
            'https://administracion.example.test',
        ]]);

        $this->withHeaders([
            'Origin' => 'https://frontend.example.test',
            'Access-Control-Request-Method' => 'GET',
            'Access-Control-Request-Headers' => 'Authorization, Content-Type',
        ])->options('/api/dashboard')
            ->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', 'https://frontend.example.test');

        $this->withHeaders([
            'Origin' => 'https://malicioso.example.test',
            'Access-Control-Request-Method' => 'GET',
        ])->options('/api/dashboard')
            ->assertNoContent()
            ->assertHeaderMissing('Access-Control-Allow-Origin');
    }

    public function test_hsts_is_sent_only_for_secure_production_requests(): void
    {
        Passport::actingAs($this->crearAgricultor());
        config([
            'security.hsts_max_age' => 600,
            'security.hsts_include_subdomains' => false,
        ]);
        $this->app->detectEnvironment(static fn (): string => 'production');

        try {
            $this->getJson('https://localhost/api/dashboard')
                ->assertOk()
                ->assertHeader(
                    'Strict-Transport-Security',
                    'max-age=600'
                );
        } finally {
            $this->app->detectEnvironment(static fn (): string => 'testing');
        }
    }

    private function crearAgricultor(): Usuario
    {
        $plan = Plan::create([
            'nombre' => 'Pruebas',
            'codigo' => 'seguridad',
            'precio_mensual' => 0,
            'limite_fincas' => 10,
            'estado' => true,
        ]);

        return Usuario::create([
            'id_plan' => $plan->id_plan,
            'nombre' => 'Usuario',
            'apellidos' => 'Seguridad',
            'correo' => 'seguridad@example.test',
            'acceso' => 'seguridad@example.test',
            'secreto' => Hash::make('Contrasena-segura-123'),
            'rol' => 'Agricultor',
            'estado' => true,
            'estado_pago' => 'Activo',
        ]);
    }
}
