<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;

use App\Models\Finca;

class ClimaController extends Controller
{
    public function finca($id)
    {
        $usuario = request()->user();

        $finca = Finca::whereKey($id)->first();

        if (!$finca) {
            return response()->json([
                'message' => 'Finca no encontrada'
            ], 404);
        }

        if (
            $usuario->rol === 'Agricultor'
            &&
            $finca->id_usuario !== $usuario->id_usuario
        ) {
            return response()->json([
                'message' => 'No autorizado'
            ], 403);
        }

        if (!$finca->latitud || !$finca->longitud) {
            return response()->json([
                'message' => 'La finca no tiene coordenadas registradas'
            ], 422);
        }

        $respuesta = Http::timeout(10)->get(
            'https://api.open-meteo.com/v1/forecast',
            [
                'latitude' => $finca->latitud,
                'longitude' => $finca->longitud,
                'current' => implode(',', [
                    'temperature_2m',
                    'relative_humidity_2m',
                    'precipitation',
                    'rain',
                    'wind_speed_10m',
                    'weather_code'
                ]),
                'hourly' => implode(',', [
                    'precipitation_probability',
                    'temperature_2m',
                    'relative_humidity_2m'
                ]),
                'forecast_days' => 1,
                'timezone' => 'America/Costa_Rica'
            ]
        );

        if (!$respuesta->successful()) {
            return response()->json([
                'message' => 'No se pudo consultar el clima'
            ], 500);
        }

        $datos = $respuesta->json();

        $probabilidades = $datos['hourly']['precipitation_probability'] ?? [];

        $probabilidadMaxima = count($probabilidades) > 0
            ? max($probabilidades)
            : 0;

        $temperatura = $datos['current']['temperature_2m'] ?? null;
        $humedad = $datos['current']['relative_humidity_2m'] ?? null;
        $lluvia = $datos['current']['rain'] ?? null;
        $viento = $datos['current']['wind_speed_10m'] ?? null;

        return response()->json([
            'finca' => [
                'id_finca' => $finca->id_finca,
                'nombre' => $finca->nombre,
                'latitud' => $finca->latitud,
                'longitud' => $finca->longitud
            ],

            'clima_actual' => [
                'temperatura' => $temperatura,
                'humedad' => $humedad,
                'lluvia' => $lluvia,
                'viento' => $viento,
                'probabilidad_lluvia' => $probabilidadMaxima
            ],

            'recomendacion' => $this->generarRecomendacion(
                $temperatura,
                $humedad,
                $probabilidadMaxima,
                $viento
            )
        ]);
    }

    private function generarRecomendacion(
        $temperatura,
        $humedad,
        $probabilidadLluvia,
        $viento
    ): string {

        if ($probabilidadLluvia >= 60) {
            return 'Alta probabilidad de lluvia. Evite aplicar plaguicidas o fertilizantes foliares.';
        }

        if ($viento !== null && $viento >= 25) {
            return 'Viento elevado. Evite aplicaciones para reducir deriva del producto.';
        }

        if ($humedad !== null && $humedad >= 85) {
            return 'Humedad alta. Revise posibles riesgos de hongos en los cultivos.';
        }

        if ($temperatura !== null && $temperatura >= 32) {
            return 'Temperatura alta. Priorice riego y evite aplicaciones en horas de mayor calor.';
        }

        return 'Condiciones climáticas estables para actividades agrícolas.';
    }
}