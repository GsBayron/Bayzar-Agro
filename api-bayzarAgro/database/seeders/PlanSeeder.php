<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $planes = [
            [
                'codigo' => 'gratuito',
                'nombre' => 'Gratuito',
                'precio_mensual' => 0,
                'descripcion' => 'Plan básico para iniciar en BayzarAgro.',
                'limite_usuarios' => 1,
                'limite_fincas' => 1,
                'almacenamiento_mb' => 100,
                'soporte' => 'Básico',
                'destacado' => false,
                'estado' => true,
            ],
            [
                'codigo' => 'emprendedor',
                'nombre' => 'Emprendedor',
                'precio_mensual' => 5000,
                'descripcion' => 'Plan para productores que necesitan más control y reportes.',
                'limite_usuarios' => 3,
                'limite_fincas' => 5,
                'almacenamiento_mb' => 500,
                'soporte' => 'Prioritario',
                'destacado' => false,
                'estado' => true,
            ],
            [
                'codigo' => 'profesional',
                'nombre' => 'Profesional',
                'precio_mensual' => 10000,
                'descripcion' => 'Plan completo para gestión agrícola avanzada.',
                'limite_usuarios' => 10,
                'limite_fincas' => 20,
                'almacenamiento_mb' => 2000,
                'soporte' => 'Preferencial',
                'destacado' => true,
                'estado' => true,
            ],
        ];

        foreach ($planes as $plan) {
            Plan::query()->updateOrCreate(
                ['codigo' => $plan['codigo']],
                $plan
            );
        }
    }
}
