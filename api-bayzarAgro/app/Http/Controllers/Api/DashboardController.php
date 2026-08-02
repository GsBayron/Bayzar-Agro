<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use App\Models\Usuario;
use App\Models\Finca;
use App\Models\Cultivo;
use App\Models\Inventario;
use App\Models\Actividad;
use App\Models\PlagaCultivo;
use App\Models\Costo;
use App\Models\Produccion;
use App\Models\Ingreso;

use Carbon\Carbon;

use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $usuario = request()->user();

        $hoy = Carbon::today()->toDateString();

        $limiteVencimiento = Carbon::today()
            ->addDays(30)
            ->toDateString();

        $respuesta = [];

        if ($usuario->rol === 'Administrador') {

            $respuesta['usuarios'] = Usuario::query()
                ->where('estado', '=', 1)
                ->count();

            $respuesta['agricultores'] = Usuario::query()
                ->where('rol', '=', 'Agricultor')
                ->where('estado', '=', 1)
                ->count();

            $respuesta['fincas'] = Finca::query()
                ->where('estado', '=', 1)
                ->count();

            $respuesta['cultivos'] = Cultivo::query()
                ->where('estado', '=', 1)
                ->count();

            $respuesta['inventario'] = Inventario::query()
                ->where('estado', '=', 1)
                ->count();

            $respuesta['plagas'] = PlagaCultivo::query()
                ->where('estado', '=', 1)
                ->count();

        } else {

            $respuesta['mis_fincas'] = Finca::query()
                ->where('id_usuario', '=', $usuario->id_usuario)
                ->where('estado', '=', 1)
                ->count();

            $respuesta['mis_cultivos'] = Cultivo::query()
                ->whereHas('finca', function ($query) use ($usuario) {
                    $query->where(
                        'id_usuario',
                        '=',
                        $usuario->id_usuario
                    );
                })
                ->where('estado', '=', 1)
                ->count();

            $respuesta['mi_inventario'] = Inventario::query()
                ->where('id_usuario', '=', $usuario->id_usuario)
                ->where('estado', '=', 1)
                ->count();

            $respuesta['mis_plagas'] = PlagaCultivo::query()
                ->whereHas('cultivo.finca', function ($query) use ($usuario) {
                    $query->where(
                        'id_usuario',
                        '=',
                        $usuario->id_usuario
                    );
                })
                ->where('estado', '=', 1)
                ->count();
        }

        /*
        |--------------------------------------------------------------------------
        | ACTIVIDADES
        |--------------------------------------------------------------------------
        */

        $actividadesHoy = Actividad::query()
            ->where('fecha_programada', '=', $hoy)
            ->whereNotIn('estado_actividad', [
                'Realizada',
                'Cancelada'
            ])
            ->where('estado', '=', 1);

        $actividadesVencidas = Actividad::query()
            ->where('fecha_programada', '<', $hoy)
            ->whereNotIn('estado_actividad', [
                'Realizada',
                'Cancelada'
            ])
            ->where('estado', '=', 1);

        if ($usuario->rol !== 'Administrador') {

            $actividadesHoy->whereHas('cultivo.finca', function ($query) use ($usuario) {
                $query->where(
                    'id_usuario',
                    '=',
                    $usuario->id_usuario
                );
            });

            $actividadesVencidas->whereHas('cultivo.finca', function ($query) use ($usuario) {
                $query->where(
                    'id_usuario',
                    '=',
                    $usuario->id_usuario
                );
            });
        }

        $respuesta['actividades_hoy'] = $actividadesHoy->count();
        $respuesta['actividades_vencidas'] = $actividadesVencidas->count();

        /*
        |--------------------------------------------------------------------------
        | PRODUCTOS POR VENCER
        |--------------------------------------------------------------------------
        */

        $productosPorVencer = Inventario::query()
            ->where('fecha_vencimiento', '<=', $limiteVencimiento)
            ->where('estado', '=', 1);

        if ($usuario->rol !== 'Administrador') {
            $productosPorVencer->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        $respuesta['productos_por_vencer'] = $productosPorVencer->count();

        /*
        |--------------------------------------------------------------------------
        | COSTOS, INGRESOS Y GANANCIA
        |--------------------------------------------------------------------------
        */

        $costos = Costo::query()
            ->where('estado', '=', 1);

        $ingresos = Ingreso::query()
            ->where('estado', '=', 1);

        $produccion = Produccion::query()
            ->where('estado', '=', 1);

        if ($usuario->rol !== 'Administrador') {

            $costos->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );

            $ingresos->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );

            $produccion->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        $totalCostos = (float) ($costos->sum('monto') ?? 0);
        $totalIngresos = (float) ($ingresos->sum('monto_total') ?? 0);

        $respuesta['total_costos'] = $totalCostos;
        $respuesta['total_ingresos'] = $totalIngresos;
        $respuesta['ganancia_estimada'] = $totalIngresos - $totalCostos;

        if ($usuario->rol === 'Administrador') {

            $respuesta['ingresos_por_agricultor'] = DB::table('tbl_usuario as u')
                ->leftJoin('tbl_ingreso as i', function ($join) {
                    $join->on('u.id_usuario', '=', 'i.id_usuario')
                        ->where('i.estado', '=', 1);
                })
                ->where('u.rol', '=', 'Agricultor')
                ->where('u.estado', '=', 1)
                ->select(
                    'u.id_usuario',
                    'u.nombre',
                    'u.apellidos',
                    'u.correo',
                    DB::raw('COALESCE(SUM(i.monto_total), 0) as total_ingresos'),
                    DB::raw('COUNT(i.id_ingreso) as cantidad_ingresos')
                )
                ->groupBy(
                    'u.id_usuario',
                    'u.nombre',
                    'u.apellidos',
                    'u.correo'
                )
                ->orderBy('u.nombre', 'asc')
                ->get();
        } else {

            $respuesta['ingresos_por_agricultor'] = [];
        }

        $respuesta['registros_produccion'] = $produccion->count();

        /*
        |--------------------------------------------------------------------------
        | ALERTAS CRÍTICAS
        |--------------------------------------------------------------------------
        */

        $respuesta['alertas_criticas'] = $this->contarAlertasCriticas(
            $usuario,
            $hoy
        );

        /*
        |--------------------------------------------------------------------------
        | LISTAS PARA EL DASHBOARD
        |--------------------------------------------------------------------------
        */

        $respuesta['proximas_actividades'] = $this->proximasActividades(
            $usuario
        );

        $respuesta['plagas_criticas'] = $this->plagasCriticas(
            $usuario
        );

        $respuesta['productos_vencen_pronto'] = $this->productosVencenPronto(
            $usuario,
            $limiteVencimiento
        );

        $respuesta['ultimos_costos'] = $this->ultimosCostos(
            $usuario
        );

        $respuesta['ultimos_ingresos'] = $this->ultimosIngresos(
            $usuario
        );

        $respuesta['ultimas_producciones'] = $this->ultimasProducciones(
            $usuario
        );

        return response()->json($respuesta);
    }

    private function contarAlertasCriticas($usuario, string $hoy): int
    {
        $productosVencidos = Inventario::query()
            ->where('fecha_vencimiento', '<', $hoy)
            ->where('estado', '=', 1);

        $actividadesVencidas = Actividad::query()
            ->where('fecha_programada', '<', $hoy)
            ->whereNotIn('estado_actividad', [
                'Realizada',
                'Cancelada'
            ])
            ->where('estado', '=', 1);

        $plagasCriticas = PlagaCultivo::query()
            ->where('nivel_riesgo', '=', 'Crítico')
            ->where('estado', '=', 1);

        if ($usuario->rol !== 'Administrador') {

            $productosVencidos->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );

            $actividadesVencidas->whereHas('cultivo.finca', function ($query) use ($usuario) {
                $query->where(
                    'id_usuario',
                    '=',
                    $usuario->id_usuario
                );
            });

            $plagasCriticas->whereHas('cultivo.finca', function ($query) use ($usuario) {
                $query->where(
                    'id_usuario',
                    '=',
                    $usuario->id_usuario
                );
            });
        }

        return $productosVencidos->count()
            + $actividadesVencidas->count()
            + $plagasCriticas->count();
    }

    private function proximasActividades($usuario)
    {
        $consulta = Actividad::with([
            'cultivo.finca',
            'inventario.plaguicida',
            'inventario.fertilizante'
        ])
            ->where('estado', '=', 1)
            ->whereNotIn('estado_actividad', [
                'Realizada',
                'Cancelada'
            ])
            ->orderBy('fecha_programada', 'asc')
            ->limit(5);

        if ($usuario->rol !== 'Administrador') {
            $consulta->whereHas('cultivo.finca', function ($query) use ($usuario) {
                $query->where(
                    'id_usuario',
                    '=',
                    $usuario->id_usuario
                );
            });
        }

        return $consulta->get();
    }

    private function plagasCriticas($usuario)
    {
        $consulta = PlagaCultivo::with([
            'cultivo.finca',
            'plaga'
        ])
            ->where('nivel_riesgo', '=', 'Crítico')
            ->where('estado', '=', 1)
            ->orderBy('fecha_deteccion', 'desc')
            ->limit(5);

        if ($usuario->rol !== 'Administrador') {
            $consulta->whereHas('cultivo.finca', function ($query) use ($usuario) {
                $query->where(
                    'id_usuario',
                    '=',
                    $usuario->id_usuario
                );
            });
        }

        return $consulta->get();
    }

    private function productosVencenPronto($usuario, string $limiteVencimiento)
    {
        $consulta = Inventario::with([
            'finca',
            'plaguicida',
            'fertilizante'
        ])
            ->where('fecha_vencimiento', '<=', $limiteVencimiento)
            ->where('estado', '=', 1)
            ->orderBy('fecha_vencimiento', 'asc')
            ->limit(5);

        if ($usuario->rol !== 'Administrador') {
            $consulta->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        return $consulta->get();
    }

    private function ultimosCostos($usuario)
    {
        $consulta = Costo::with([
            'finca',
            'cultivo',
            'actividad'
        ])
            ->where('estado', '=', 1)
            ->orderBy('fecha', 'desc')
            ->orderBy('id_costo', 'desc')
            ->limit(5);

        if ($usuario->rol !== 'Administrador') {
            $consulta->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        return $consulta->get();
    }

    private function ultimosIngresos($usuario)
    {
        $consulta = Ingreso::with([
            'finca',
            'cultivo',
            'produccion'
        ])
            ->where('estado', '=', 1)
            ->orderBy('fecha', 'desc')
            ->orderBy('id_ingreso', 'desc')
            ->limit(5);

        if ($usuario->rol !== 'Administrador') {
            $consulta->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        return $consulta->get();
    }

    private function ultimasProducciones($usuario)
    {
        $consulta = Produccion::with([
            'finca',
            'cultivo'
        ])
            ->where('estado', '=', 1)
            ->orderBy('fecha', 'desc')
            ->orderBy('id_produccion', 'desc')
            ->limit(5);

        if ($usuario->rol !== 'Administrador') {
            $consulta->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        return $consulta->get();
    }
}
