<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Finca;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;

class ClimaController extends Controller
{
    public function finca($id)
    {
        $usuario = request()->user();

        $finca = Finca::whereKey($id)->first();

        if (! $finca) {
            return response()->json([
                'message' => 'Finca no encontrada',
            ], 404);
        }

        if (
            $usuario->rol !== 'Administrador'
            &&
            $finca->id_usuario !== $usuario->id_usuario
        ) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        if (
            $finca->latitud === null || $finca->latitud === ''
            || $finca->longitud === null || $finca->longitud === ''
        ) {
            return response()->json([
                'message' => 'La finca no tiene coordenadas registradas',
            ], 422);
        }

        $cacheKey = sprintf(
            'clima:finca:%s:%s',
            $finca->id_finca,
            sha1($finca->latitud.'|'.$finca->longitud)
        );

        try {
            $datos = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($finca) {
                $respuesta = Http::retry(2, 250)
                    ->timeout(10)
                    ->get('https://api.open-meteo.com/v1/forecast', [
                        'latitude' => $finca->latitud,
                        'longitude' => $finca->longitud,
                        'current' => implode(',', [
                            'temperature_2m',
                            'relative_humidity_2m',
                            'precipitation',
                            'rain',
                            'wind_speed_10m',
                            'weather_code',
                        ]),
                        'hourly' => implode(',', [
                            'precipitation_probability',
                            'temperature_2m',
                            'relative_humidity_2m',
                        ]),
                        'forecast_days' => 1,
                        'timezone' => 'America/Costa_Rica',
                    ]);

                if (! $respuesta->successful() || ! is_array($respuesta->json())) {
                    throw new RuntimeException(
                        'El proveedor de clima respondió con estado '.$respuesta->status()
                    );
                }

                return $respuesta->json();
            });
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'El servicio de clima no está disponible temporalmente',
            ], 503);
        }

        $probabilidades = $datos['hourly']['precipitation_probability'] ?? [];
        $probabilidades = is_array($probabilidades)
            ? array_values(array_filter($probabilidades, 'is_numeric'))
            : [];

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
                'longitud' => $finca->longitud,
            ],

            'clima_actual' => [
                'temperatura' => $temperatura,
                'humedad' => $humedad,
                'lluvia' => $lluvia,
                'viento' => $viento,
                'probabilidad_lluvia' => $probabilidadMaxima,
            ],

            'recomendacion' => $this->generarRecomendacion(
                $temperatura,
                $humedad,
                $probabilidadMaxima,
                $viento
            ),
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
