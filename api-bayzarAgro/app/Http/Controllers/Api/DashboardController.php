<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use App\Models\Usuario;
use App\Models\Finca;
use App\Models\Cultivo;
use App\Models\Inventario;
use App\Models\PlagaCultivo;
use App\Models\Actividad;

use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $usuario = request()->user();

        $hoy = Carbon::today()->toDateString();

        $limiteVencimiento = Carbon::today()
            ->addDays(30)
            ->toDateString();

        // DASHBOARD ADMINISTRADOR
        if ($usuario->rol === 'Administrador') {

            return response()->json([

                'usuarios' => Usuario::query()
                    ->where('estado', '=', 1)
                    ->count(),

                'agricultores' => Usuario::query()
                    ->where('rol', '=', 'Agricultor')
                    ->where('estado', '=', 1)
                    ->count(),

                'fincas' => Finca::query()
                    ->where('estado', '=', 1)
                    ->count(),

                'cultivos' => Cultivo::query()
                    ->where('estado', '=', 1)
                    ->count(),

                'inventario' => Inventario::query()
                    ->where('estado', '=', 1)
                    ->count(),

                'plagas' => PlagaCultivo::query()
                    ->where('estado', '=', 1)
                    ->count(),

                'actividades_hoy' => Actividad::query()
                    ->where('fecha_programada', '=', $hoy)
                    ->count(),

                'actividades_vencidas' => Actividad::query()
                    ->where('fecha_programada', '<', $hoy)
                    ->whereNotIn('estado_actividad', [
                        'Realizada',
                        'Cancelada'
                    ])
                    ->count(),

                'productos_por_vencer' => Inventario::query()
                    ->where('fecha_vencimiento', '>=', $hoy)
                    ->where('fecha_vencimiento', '<=', $limiteVencimiento)
                    ->where('estado', '=', 1)
                    ->count(),

                'proximas_actividades' => Actividad::with([
                    'cultivo'
                ])
                    ->where('fecha_programada', '>=', $hoy)
                    ->whereNotIn('estado_actividad', [
                        'Realizada',
                        'Cancelada'
                    ])
                    ->orderBy('fecha_programada', 'asc')
                    ->take(5)
                    ->get(),

                'plagas_criticas' => PlagaCultivo::with([
                    'cultivo',
                    'plaga'
                ])
                    ->where('nivel_riesgo', '=', 'Crítico')
                    ->where('estado', '=', 1)
                    ->orderBy('fecha_deteccion', 'desc')
                    ->take(5)
                    ->get(),

                'productos_vencen_pronto' => Inventario::with([
                    'finca',
                    'plaguicida',
                    'fertilizante'
                ])
                    ->where('fecha_vencimiento', '>=', $hoy)
                    ->where('fecha_vencimiento', '<=', $limiteVencimiento)
                    ->where('estado', '=', 1)
                    ->orderBy('fecha_vencimiento', 'asc')
                    ->take(5)
                    ->get()
            ]);
        }

        // DASHBOARD AGRICULTOR
        return response()->json([

            'mis_fincas' => Finca::query()
                ->where('id_usuario', '=', $usuario->id_usuario)
                ->where('estado', '=', 1)
                ->count(),

            'mis_cultivos' => Cultivo::query()
                ->whereHas('finca', function ($query) use ($usuario) {

                    $query->where(
                        'id_usuario',
                        '=',
                        $usuario->id_usuario
                    );

                })
                ->where('estado', '=', 1)
                ->count(),

            'mi_inventario' => Inventario::query()
                ->where('id_usuario', '=', $usuario->id_usuario)
                ->where('estado', '=', 1)
                ->count(),

            'mis_plagas' => PlagaCultivo::query()
                ->whereHas('cultivo.finca', function ($query) use ($usuario) {

                    $query->where(
                        'id_usuario',
                        '=',
                        $usuario->id_usuario
                    );

                })
                ->where('estado', '=', 1)
                ->count(),

            'actividades_hoy' => Actividad::query()
                ->whereHas('cultivo.finca', function ($query) use ($usuario) {

                    $query->where(
                        'id_usuario',
                        '=',
                        $usuario->id_usuario
                    );

                })
                ->where('fecha_programada', '=', $hoy)
                ->count(),

            'actividades_vencidas' => Actividad::query()
                ->whereHas('cultivo.finca', function ($query) use ($usuario) {

                    $query->where(
                        'id_usuario',
                        '=',
                        $usuario->id_usuario
                    );

                })
                ->where('fecha_programada', '<', $hoy)
                ->whereNotIn('estado_actividad', [
                    'Realizada',
                    'Cancelada'
                ])
                ->count(),

            'productos_por_vencer' => Inventario::query()
                ->where('id_usuario', '=', $usuario->id_usuario)
                ->where('fecha_vencimiento', '>=', $hoy)
                ->where('fecha_vencimiento', '<=', $limiteVencimiento)
                ->where('estado', '=', 1)
                ->count(),

            'proximas_actividades' => Actividad::with([
                'cultivo'
            ])
                ->whereHas('cultivo.finca', function ($query) use ($usuario) {

                    $query->where(
                        'id_usuario',
                        '=',
                        $usuario->id_usuario
                    );

                })
                ->where('fecha_programada', '>=', $hoy)
                ->whereNotIn('estado_actividad', [
                    'Realizada',
                    'Cancelada'
                ])
                ->orderBy('fecha_programada', 'asc')
                ->take(5)
                ->get(),

            'plagas_criticas' => PlagaCultivo::with([
                'cultivo',
                'plaga'
            ])
                ->whereHas('cultivo.finca', function ($query) use ($usuario) {

                    $query->where(
                        'id_usuario',
                        '=',
                        $usuario->id_usuario
                    );

                })
                ->where('nivel_riesgo', '=', 'Crítico')
                ->where('estado', '=', 1)
                ->orderBy('fecha_deteccion', 'desc')
                ->take(5)
                ->get(),

            'productos_vencen_pronto' => Inventario::with([
                'finca',
                'plaguicida',
                'fertilizante'
            ])
                ->where('id_usuario', '=', $usuario->id_usuario)
                ->where('fecha_vencimiento', '>=', $hoy)
                ->where('fecha_vencimiento', '<=', $limiteVencimiento)
                ->where('estado', '=', 1)
                ->orderBy('fecha_vencimiento', 'asc')
                ->take(5)
                ->get()
        ]);
    }
}