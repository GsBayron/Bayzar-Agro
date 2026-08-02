<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cultivo;
use App\Models\Finca;
use App\Models\Ingreso;
use App\Models\Produccion;
use Illuminate\Http\Request;

class IngresoController extends Controller
{
    public function listar()
    {
        $usuario = request()->user();

        $consulta = Ingreso::with([
            'usuario',
            'finca',
            'cultivo',
            'produccion',
        ])
            ->orderBy('fecha', 'desc')
            ->orderBy('id_ingreso', 'desc');

        if ($usuario->rol !== 'Administrador') {
            $consulta->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        return response()->json(
            $consulta->get()
        );
    }

    public function consultar($id)
    {
        $usuario = request()->user();

        $consulta = Ingreso::with([
            'usuario',
            'finca',
            'cultivo',
            'produccion',
        ])
            ->where('id_ingreso', '=', $id);

        if ($usuario->rol !== 'Administrador') {
            $consulta->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        $ingreso = $consulta->first();

        if (! $ingreso) {
            return response()->json([
                'message' => 'Ingreso no encontrado',
            ], 404);
        }

        return response()->json($ingreso);
    }

    public function guardar(Request $request)
    {
        $usuario = $request->user();

        $request->validate([
            'id_finca' => 'required|integer|exists:tbl_finca,id_finca',
            'id_cultivo' => 'required|integer|exists:tbl_cultivo,id_cultivo',
            'id_produccion' => 'nullable|integer|exists:tbl_produccion,id_produccion',

            'fecha' => 'required|date',
            'descripcion' => 'required|string|max:255',

            'cantidad_vendida' => 'required|numeric|gt:0',
            'unidad_medida' => 'required|string|max:50',

            'precio_unitario' => 'required|numeric|min:0',
            'monto_total' => 'nullable|numeric|min:0',

            'cliente' => 'nullable|string|max:150',
            'destino' => 'nullable|string|max:100',

            'observaciones' => 'nullable|string',
            'estado' => 'required|boolean',
        ]);

        $finca = Finca::query()
            ->where('id_finca', '=', $request->id_finca);

        if ($usuario->rol !== 'Administrador') {
            $finca->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        $finca = $finca->first();

        if (! $finca) {
            return response()->json([
                'message' => 'Finca no encontrada o no autorizada',
            ], 403);
        }

        $cultivo = Cultivo::query()
            ->where('id_cultivo', '=', $request->id_cultivo)
            ->where('id_finca', '=', $request->id_finca)
            ->first();

        if (! $cultivo) {
            return response()->json([
                'message' => 'El cultivo no pertenece a la finca seleccionada',
            ], 422);
        }

        if ($request->id_produccion) {
            $produccion = Produccion::query()
                ->where('id_produccion', '=', $request->id_produccion)
                ->where('id_finca', '=', $request->id_finca)
                ->where('id_cultivo', '=', $request->id_cultivo)
                ->first();

            if (! $produccion) {
                return response()->json([
                    'message' => 'La producción no pertenece al cultivo seleccionado',
                ], 422);
            }
        }

        $ingreso = Ingreso::create([
            'id_usuario' => $usuario->id_usuario,
            'id_finca' => $request->id_finca,
            'id_cultivo' => $request->id_cultivo,
            'id_produccion' => $request->id_produccion,

            'fecha' => $request->fecha,
            'descripcion' => $request->descripcion,

            'cantidad_vendida' => $request->cantidad_vendida,
            'unidad_medida' => $request->unidad_medida,

            'precio_unitario' => $request->precio_unitario,
            'monto_total' => round(
                $request->cantidad_vendida * $request->precio_unitario,
                2
            ),

            'cliente' => $request->cliente,
            'destino' => $request->destino,

            'observaciones' => $request->observaciones,
            'estado' => $request->estado,
        ]);

        return response()->json([
            'message' => 'Ingreso registrado correctamente',
            'data' => $ingreso,
        ], 201);
    }

    public function actualizar(Request $request, $id)
    {
        $usuario = $request->user();

        $consulta = Ingreso::query()
            ->where('id_ingreso', '=', $id);

        if ($usuario->rol !== 'Administrador') {
            $consulta->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        $ingreso = $consulta->first();

        if (! $ingreso) {
            return response()->json([
                'message' => 'Ingreso no encontrado',
            ], 404);
        }

        $request->validate([
            'id_finca' => 'required|integer|exists:tbl_finca,id_finca',
            'id_cultivo' => 'required|integer|exists:tbl_cultivo,id_cultivo',
            'id_produccion' => 'nullable|integer|exists:tbl_produccion,id_produccion',

            'fecha' => 'required|date',
            'descripcion' => 'required|string|max:255',

            'cantidad_vendida' => 'required|numeric|gt:0',
            'unidad_medida' => 'required|string|max:50',

            'precio_unitario' => 'required|numeric|min:0',
            'monto_total' => 'nullable|numeric|min:0',

            'cliente' => 'nullable|string|max:150',
            'destino' => 'nullable|string|max:100',

            'observaciones' => 'nullable|string',
            'estado' => 'required|boolean',
        ]);

        $finca = Finca::query()
            ->where('id_finca', '=', $request->id_finca);

        if ($usuario->rol !== 'Administrador') {
            $finca->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        $finca = $finca->first();

        if (! $finca) {
            return response()->json([
                'message' => 'Finca no encontrada o no autorizada',
            ], 403);
        }

        $cultivo = Cultivo::query()
            ->where('id_cultivo', '=', $request->id_cultivo)
            ->where('id_finca', '=', $request->id_finca)
            ->first();

        if (! $cultivo) {
            return response()->json([
                'message' => 'El cultivo no pertenece a la finca seleccionada',
            ], 422);
        }

        if ($request->id_produccion) {
            $produccion = Produccion::query()
                ->where('id_produccion', '=', $request->id_produccion)
                ->where('id_finca', '=', $request->id_finca)
                ->where('id_cultivo', '=', $request->id_cultivo)
                ->first();

            if (! $produccion) {
                return response()->json([
                    'message' => 'La producción no pertenece al cultivo seleccionado',
                ], 422);
            }
        }

        $ingreso->update([
            'id_finca' => $request->id_finca,
            'id_cultivo' => $request->id_cultivo,
            'id_produccion' => $request->id_produccion,

            'fecha' => $request->fecha,
            'descripcion' => $request->descripcion,

            'cantidad_vendida' => $request->cantidad_vendida,
            'unidad_medida' => $request->unidad_medida,

            'precio_unitario' => $request->precio_unitario,
            'monto_total' => round(
                $request->cantidad_vendida * $request->precio_unitario,
                2
            ),

            'cliente' => $request->cliente,
            'destino' => $request->destino,

            'observaciones' => $request->observaciones,
            'estado' => $request->estado,
        ]);

        return response()->json([
            'message' => 'Ingreso actualizado correctamente',
            'data' => $ingreso,
        ]);
    }

    public function eliminar($id)
    {
        $usuario = request()->user();

        $consulta = Ingreso::query()
            ->where('id_ingreso', '=', $id);

        if ($usuario->rol !== 'Administrador') {
            $consulta->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        $ingreso = $consulta->first();
        if (! $ingreso) {
            return response()->json([
                'message' => 'Ingreso no encontrado',
            ], 404);
        }

        $ingreso->delete();

        return response()->json([
            'message' => 'Ingreso eliminado correctamente',
        ]);
    }
}
