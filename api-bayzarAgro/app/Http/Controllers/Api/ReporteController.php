<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Ingreso;
use App\Models\Costo;
use App\Models\Produccion;

class ReporteController extends Controller
{
    public function financiero(Request $request)
    {
        $usuario = $request->user();

        $request->validate([
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'id_usuario' => 'nullable|integer',
            'id_finca' => 'nullable|integer',
            'id_cultivo' => 'nullable|integer'
        ]);

        /*
        |--------------------------------------------------------------------------
        | CONSULTAS BASE
        |--------------------------------------------------------------------------
        */

        $ingresos = Ingreso::with([
            'usuario',
            'finca',
            'cultivo',
            'produccion'
        ])
            ->where('estado', '=', 1);

        $costos = Costo::with([
            'usuario',
            'finca',
            'cultivo',
            'actividad'
        ])
            ->where('estado', '=', 1);

        $producciones = Produccion::with([
            'usuario',
            'finca',
            'cultivo'
        ])
            ->where('estado', '=', 1);

        $this->aplicarFiltrosModelo(
            $ingresos,
            $request,
            $usuario
        );

        $this->aplicarFiltrosModelo(
            $costos,
            $request,
            $usuario
        );

        $this->aplicarFiltrosModelo(
            $producciones,
            $request,
            $usuario
        );

        /*
        |--------------------------------------------------------------------------
        | RESUMEN GENERAL
        |--------------------------------------------------------------------------
        */

        $totalIngresos = (float) (
            (clone $ingresos)->sum('monto_total') ?? 0
        );

        $totalCostos = (float) (
            (clone $costos)->sum('monto') ?? 0
        );

        $gananciaEstimada = $totalIngresos - $totalCostos;

        $cantidadIngresos = (clone $ingresos)
            ->count();

        $cantidadCostos = (clone $costos)
            ->count();

        $cantidadProducciones = (clone $producciones)
            ->count();

        $margenGanancia = 0;

        if ($totalIngresos > 0) {
            $margenGanancia = round(
                ($gananciaEstimada / $totalIngresos) * 100,
                2
            );
        }

        /*
        |--------------------------------------------------------------------------
        | ÚLTIMOS REGISTROS
        |--------------------------------------------------------------------------
        */

        $ultimosIngresos = (clone $ingresos)
            ->orderBy('fecha', 'desc')
            ->orderBy('id_ingreso', 'desc')
            ->limit(10)
            ->get();

        $ultimosCostos = (clone $costos)
            ->orderBy('fecha', 'desc')
            ->orderBy('id_costo', 'desc')
            ->limit(10)
            ->get();

        $ultimasProducciones = (clone $producciones)
            ->orderBy('fecha', 'desc')
            ->orderBy('id_produccion', 'desc')
            ->limit(10)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | AGRUPACIONES
        |--------------------------------------------------------------------------
        */

        $ingresosPorCultivo = DB::table('tbl_ingreso as i')
            ->leftJoin('tbl_cultivo as c', 'i.id_cultivo', '=', 'c.id_cultivo')
            ->leftJoin('tbl_finca as f', 'i.id_finca', '=', 'f.id_finca')
            ->where('i.estado', '=', 1);

        $this->aplicarFiltrosQuery(
            $ingresosPorCultivo,
            $request,
            $usuario,
            'i'
        );

        $ingresosPorCultivo = $ingresosPorCultivo
            ->select(
                'c.id_cultivo',
                'c.nombre as cultivo',
                'f.nombre as finca',
                DB::raw('COALESCE(SUM(i.monto_total), 0) as total_ingresos'),
                DB::raw('COUNT(i.id_ingreso) as cantidad_ingresos')
            )
            ->groupBy(
                'c.id_cultivo',
                'c.nombre',
                'f.nombre'
            )
            ->orderBy('total_ingresos', 'desc')
            ->get();

        $costosPorCultivo = DB::table('tbl_costo as co')
            ->leftJoin('tbl_cultivo as c', 'co.id_cultivo', '=', 'c.id_cultivo')
            ->leftJoin('tbl_finca as f', 'co.id_finca', '=', 'f.id_finca')
            ->where('co.estado', '=', 1);

        $this->aplicarFiltrosQuery(
            $costosPorCultivo,
            $request,
            $usuario,
            'co'
        );

        $costosPorCultivo = $costosPorCultivo
            ->select(
                'c.id_cultivo',
                'c.nombre as cultivo',
                'f.nombre as finca',
                DB::raw('COALESCE(SUM(co.monto), 0) as total_costos'),
                DB::raw('COUNT(co.id_costo) as cantidad_costos')
            )
            ->groupBy(
                'c.id_cultivo',
                'c.nombre',
                'f.nombre'
            )
            ->orderBy('total_costos', 'desc')
            ->get();

        $costosPorTipo = DB::table('tbl_costo as co')
            ->where('co.estado', '=', 1);

        $this->aplicarFiltrosQuery(
            $costosPorTipo,
            $request,
            $usuario,
            'co'
        );

        $costosPorTipo = $costosPorTipo
            ->select(
                'co.tipo_costo',
                DB::raw('COALESCE(SUM(co.monto), 0) as total_costos'),
                DB::raw('COUNT(co.id_costo) as cantidad_costos')
            )
            ->groupBy('co.tipo_costo')
            ->orderBy('total_costos', 'desc')
            ->get();

        $produccionPorCultivo = DB::table('tbl_produccion as p')
            ->leftJoin('tbl_cultivo as c', 'p.id_cultivo', '=', 'c.id_cultivo')
            ->leftJoin('tbl_finca as f', 'p.id_finca', '=', 'f.id_finca')
            ->where('p.estado', '=', 1);

        $this->aplicarFiltrosQuery(
            $produccionPorCultivo,
            $request,
            $usuario,
            'p'
        );

        $produccionPorCultivo = $produccionPorCultivo
            ->select(
                'c.id_cultivo',
                'c.nombre as cultivo',
                'f.nombre as finca',
                'p.unidad_medida',
                DB::raw('COALESCE(SUM(p.cantidad), 0) as total_producido'),
                DB::raw('COUNT(p.id_produccion) as cantidad_registros')
            )
            ->groupBy(
                'c.id_cultivo',
                'c.nombre',
                'f.nombre',
                'p.unidad_medida'
            )
            ->orderBy('total_producido', 'desc')
            ->get();

        return response()->json([
            'filtros' => [
                'fecha_inicio' => $request->fecha_inicio,
                'fecha_fin' => $request->fecha_fin,
                'id_usuario' => $request->id_usuario,
                'id_finca' => $request->id_finca,
                'id_cultivo' => $request->id_cultivo
            ],
            'resumen' => [
                'total_ingresos' => $totalIngresos,
                'total_costos' => $totalCostos,
                'ganancia_estimada' => $gananciaEstimada,
                'margen_ganancia' => $margenGanancia,
                'cantidad_ingresos' => $cantidadIngresos,
                'cantidad_costos' => $cantidadCostos,
                'cantidad_producciones' => $cantidadProducciones
            ],
            'ingresos_por_cultivo' => $ingresosPorCultivo,
            'costos_por_cultivo' => $costosPorCultivo,
            'costos_por_tipo' => $costosPorTipo,
            'produccion_por_cultivo' => $produccionPorCultivo,
            'ultimos_ingresos' => $ultimosIngresos,
            'ultimos_costos' => $ultimosCostos,
            'ultimas_producciones' => $ultimasProducciones
        ]);
    }

    private function aplicarFiltrosModelo(
        $consulta,
        Request $request,
        $usuario
    ): void {

        if ($usuario->rol !== 'Administrador') {

            $consulta->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );

        } else if ($request->filled('id_usuario')) {

            $consulta->where(
                'id_usuario',
                '=',
                $request->id_usuario
            );
        }

        if ($request->filled('id_finca')) {

            $consulta->where(
                'id_finca',
                '=',
                $request->id_finca
            );
        }

        if ($request->filled('id_cultivo')) {

            $consulta->where(
                'id_cultivo',
                '=',
                $request->id_cultivo
            );
        }

        if ($request->filled('fecha_inicio')) {

            $consulta->where(
                'fecha',
                '>=',
                $request->fecha_inicio
            );
        }

        if ($request->filled('fecha_fin')) {

            $consulta->where(
                'fecha',
                '<=',
                $request->fecha_fin
            );
        }
    }

    private function aplicarFiltrosQuery(
        $consulta,
        Request $request,
        $usuario,
        string $alias
    ): void {

        if ($usuario->rol !== 'Administrador') {

            $consulta->where(
                $alias . '.id_usuario',
                '=',
                $usuario->id_usuario
            );

        } else if ($request->filled('id_usuario')) {

            $consulta->where(
                $alias . '.id_usuario',
                '=',
                $request->id_usuario
            );
        }

        if ($request->filled('id_finca')) {

            $consulta->where(
                $alias . '.id_finca',
                '=',
                $request->id_finca
            );
        }

        if ($request->filled('id_cultivo')) {

            $consulta->where(
                $alias . '.id_cultivo',
                '=',
                $request->id_cultivo
            );
        }

        if ($request->filled('fecha_inicio')) {

            $consulta->where(
                $alias . '.fecha',
                '>=',
                $request->fecha_inicio
            );
        }

        if ($request->filled('fecha_fin')) {

            $consulta->where(
                $alias . '.fecha',
                '<=',
                $request->fecha_fin
            );
        }
    }
}
