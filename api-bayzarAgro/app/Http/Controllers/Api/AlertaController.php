<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use App\Models\Inventario;
use App\Models\Actividad;
use App\Models\PlagaCultivo;
use App\Models\Finca;

use Carbon\Carbon;

class AlertaController extends Controller
{
    public function listar()
    {
        $usuario = request()->user();

        $hoy = Carbon::today()->toDateString();

        $limite = Carbon::today()
            ->addDays(30)
            ->toDateString();

        $alertas = [];

        /*
        |--------------------------------------------------------------------------
        | PRODUCTOS VENCIDOS
        |--------------------------------------------------------------------------
        */

        $productosVencidos = Inventario::with([
            'finca',
            'plaguicida',
            'fertilizante'
        ])
            ->where('fecha_vencimiento', '<', $hoy)
            ->where('estado', '=', 1);

        if ($usuario->rol !== 'Administrador') {
            $productosVencidos->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        foreach ($productosVencidos->get() as $producto) {

            $alertas[] = [
                'tipo' => 'Producto vencido',
                'titulo' => 'Producto vencido en inventario',
                'mensaje' => 'El producto ' . $this->nombreProducto($producto) . ' ya se encuentra vencido.',
                'nivel' => 'Crítica',
                'fecha' => $producto->fecha_vencimiento,
                'origen' => 'Inventario',
                'id_origen' => $producto->id_inventario
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | PRODUCTOS POR VENCER
        |--------------------------------------------------------------------------
        */

        $productosPorVencer = Inventario::with([
            'finca',
            'plaguicida',
            'fertilizante'
        ])
            ->where('fecha_vencimiento', '>=', $hoy)
            ->where('fecha_vencimiento', '<=', $limite)
            ->where('estado', '=', 1);

        if ($usuario->rol !== 'Administrador') {
            $productosPorVencer->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        foreach ($productosPorVencer->get() as $producto) {

            $alertas[] = [
                'tipo' => 'Producto por vencer',
                'titulo' => 'Producto próximo a vencer',
                'mensaje' => 'El producto ' . $this->nombreProducto($producto) . ' vence pronto.',
                'nivel' => 'Advertencia',
                'fecha' => $producto->fecha_vencimiento,
                'origen' => 'Inventario',
                'id_origen' => $producto->id_inventario
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | ACTIVIDADES VENCIDAS
        |--------------------------------------------------------------------------
        */

        $actividadesVencidas = Actividad::with([
            'cultivo.finca'
        ])
            ->where('fecha_programada', '<', $hoy)
            ->whereNotIn('estado_actividad', [
                'Realizada',
                'Cancelada'
            ])
            ->where('estado', '=', 1);

        if ($usuario->rol !== 'Administrador') {
            $actividadesVencidas->whereHas(
                'cultivo.finca',
                function ($query) use ($usuario) {
                    $query->where(
                        'id_usuario',
                        '=',
                        $usuario->id_usuario
                    );
                }
            );
        }

        foreach ($actividadesVencidas->get() as $actividad) {

            $alertas[] = [
                'tipo' => 'Actividad vencida',
                'titulo' => 'Actividad pendiente vencida',
                'mensaje' => 'La actividad ' . $actividad->tipo_actividad . ' está vencida.',
                'nivel' => 'Crítica',
                'fecha' => $actividad->fecha_programada,
                'origen' => 'Actividades',
                'id_origen' => $actividad->id_actividad
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | ACTIVIDADES DE HOY
        |--------------------------------------------------------------------------
        */

        $actividadesHoy = Actividad::with([
            'cultivo.finca'
        ])
            ->where('fecha_programada', '=', $hoy)
            ->whereNotIn('estado_actividad', [
                'Realizada',
                'Cancelada'
            ])
            ->where('estado', '=', 1);

        if ($usuario->rol !== 'Administrador') {
            $actividadesHoy->whereHas(
                'cultivo.finca',
                function ($query) use ($usuario) {
                    $query->where(
                        'id_usuario',
                        '=',
                        $usuario->id_usuario
                    );
                }
            );
        }

        foreach ($actividadesHoy->get() as $actividad) {

            $alertas[] = [
                'tipo' => 'Actividad de hoy',
                'titulo' => 'Actividad programada para hoy',
                'mensaje' => 'Hoy está programada la actividad ' . $actividad->tipo_actividad . '.',
                'nivel' => 'Informativa',
                'fecha' => $actividad->fecha_programada,
                'origen' => 'Actividades',
                'id_origen' => $actividad->id_actividad
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | PLAGAS CRÍTICAS
        |--------------------------------------------------------------------------
        */

        $plagasCriticas = PlagaCultivo::with([
            'cultivo.finca',
            'plaga'
        ])
            ->where('nivel_riesgo', '=', 'Crítico')
            ->where('estado', '=', 1);

        if ($usuario->rol !== 'Administrador') {
            $plagasCriticas->whereHas(
                'cultivo.finca',
                function ($query) use ($usuario) {
                    $query->where(
                        'id_usuario',
                        '=',
                        $usuario->id_usuario
                    );
                }
            );
        }

        foreach ($plagasCriticas->get() as $plaga) {

            $alertas[] = [
                'tipo' => 'Plaga crítica',
                'titulo' => 'Plaga con nivel crítico',
                'mensaje' => 'Se detectó una plaga crítica: ' . $this->nombrePlaga($plaga) . '.',
                'nivel' => 'Crítica',
                'fecha' => $plaga->fecha_deteccion,
                'origen' => 'Plagas',
                'id_origen' => $plaga->id_plaga_cultivo
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | FINCAS SIN COORDENADAS
        |--------------------------------------------------------------------------
        */

        $fincasSinCoordenadas = Finca::query()
            ->where('estado', '=', 1)
            ->where(function ($query) {
                $query->whereNull('latitud')
                    ->orWhereNull('longitud');
            });

        if ($usuario->rol !== 'Administrador') {
            $fincasSinCoordenadas->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        foreach ($fincasSinCoordenadas->get() as $finca) {

            $alertas[] = [
                'tipo' => 'Finca sin coordenadas',
                'titulo' => 'Finca sin ubicación climática',
                'mensaje' => 'La finca ' . $finca->nombre . ' no tiene latitud y longitud registradas.',
                'nivel' => 'Advertencia',
                'fecha' => null,
                'origen' => 'Fincas',
                'id_origen' => $finca->id_finca
            ];
        }

        return response()->json($alertas);
    }

    private function nombreProducto($producto): string
    {
        if ($producto->plaguicida) {
            return $producto->plaguicida->nombre_comercial;
        }

        if ($producto->fertilizante) {
            return $producto->fertilizante->nombre_comercial;
        }

        return $producto->nombre_manual ?? 'Producto sin nombre';
    }

    private function nombrePlaga($plaga): string
    {
        if ($plaga->plaga) {
            return $plaga->plaga->nombre_comun;
        }

        return $plaga->nombre_manual ?? 'Plaga sin nombre';
    }
}