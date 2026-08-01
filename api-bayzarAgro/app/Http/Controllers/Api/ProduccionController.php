<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Produccion;
use App\Models\Finca;
use App\Models\Cultivo;

class ProduccionController extends Controller
{
    public function listar()
    {
        $usuario = request()->user();

        $consulta = Produccion::with([
            'usuario',
            'finca',
            'cultivo'
        ])
            ->orderBy('fecha', 'desc')
            ->orderBy('id_produccion', 'desc');

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

        $consulta = Produccion::with([
            'usuario',
            'finca',
            'cultivo'
        ])
            ->where('id_produccion', '=', $id);

        if ($usuario->rol !== 'Administrador') {
            $consulta->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        $produccion = $consulta->first();

        if (!$produccion) {
            return response()->json([
                'message' => 'Producción no encontrada'
            ], 404);
        }

        return response()->json($produccion);
    }

    public function guardar(Request $request)
    {
        $usuario = $request->user();

        $request->validate([
            'id_finca' => 'required|integer|exists:tbl_finca,id_finca',
            'id_cultivo' => 'required|integer|exists:tbl_cultivo,id_cultivo',

            'fecha' => 'required|date',

            'cantidad' => 'required|numeric|gt:0',
            'unidad_medida' => 'required|string|max:50',

            'cantidad_plantas' => 'nullable|integer|min:0',

            'calidad' => 'nullable|string|max:80',
            'destino' => 'nullable|string|max:100',

            'observaciones' => 'nullable|string',
            'estado' => 'required|boolean'
        ]);

        $finca = Finca::query()
            ->where('id_finca', '=', $request->id_finca);

        if ($usuario->rol === 'Agricultor') {
            $finca->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        $finca = $finca->first();

        if (!$finca) {
            return response()->json([
                'message' => 'Finca no encontrada o no autorizada'
            ], 403);
        }

        $cultivo = Cultivo::query()
            ->where('id_cultivo', '=', $request->id_cultivo)
            ->where('id_finca', '=', $request->id_finca)
            ->first();

        if (!$cultivo) {
            return response()->json([
                'message' => 'El cultivo no pertenece a la finca seleccionada'
            ], 422);
        }

        $produccion = Produccion::create([
            'id_usuario' => $usuario->id_usuario,
            'id_finca' => $request->id_finca,
            'id_cultivo' => $request->id_cultivo,

            'fecha' => $request->fecha,

            'cantidad' => $request->cantidad,
            'unidad_medida' => $request->unidad_medida,

            'cantidad_plantas' => $request->cantidad_plantas,

            'calidad' => $request->calidad,
            'destino' => $request->destino,

            'observaciones' => $request->observaciones,
            'estado' => $request->estado
        ]);

        return response()->json([
            'message' => 'Producción registrada correctamente',
            'data' => $produccion
        ], 201);
    }

    public function actualizar(Request $request, $id)
    {
        $usuario = $request->user();

        $consulta = Produccion::query()
            ->where('id_produccion', '=', $id);

        if ($usuario->rol !== 'Administrador') {
            $consulta->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        $produccion = $consulta->first();

        if (!$produccion) {
            return response()->json([
                'message' => 'Producción no encontrada'
            ], 404);
        }

        $request->validate([
            'id_finca' => 'required|integer|exists:tbl_finca,id_finca',
            'id_cultivo' => 'required|integer|exists:tbl_cultivo,id_cultivo',

            'fecha' => 'required|date',

            'cantidad' => 'required|numeric|gt:0',
            'unidad_medida' => 'required|string|max:50',

            'cantidad_plantas' => 'nullable|integer|min:0',

            'calidad' => 'nullable|string|max:80',
            'destino' => 'nullable|string|max:100',

            'observaciones' => 'nullable|string',
            'estado' => 'required|boolean'
        ]);

        $finca = Finca::query()
            ->where('id_finca', '=', $request->id_finca);

        if ($usuario->rol === 'Agricultor') {
            $finca->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        $finca = $finca->first();

        if (!$finca) {
            return response()->json([
                'message' => 'Finca no encontrada o no autorizada'
            ], 403);
        }

        $cultivo = Cultivo::query()
            ->where('id_cultivo', '=', $request->id_cultivo)
            ->where('id_finca', '=', $request->id_finca)
            ->first();

        if (!$cultivo) {
            return response()->json([
                'message' => 'El cultivo no pertenece a la finca seleccionada'
            ], 422);
        }

        $produccion->update([
            'id_finca' => $request->id_finca,
            'id_cultivo' => $request->id_cultivo,

            'fecha' => $request->fecha,

            'cantidad' => $request->cantidad,
            'unidad_medida' => $request->unidad_medida,

            'cantidad_plantas' => $request->cantidad_plantas,

            'calidad' => $request->calidad,
            'destino' => $request->destino,

            'observaciones' => $request->observaciones,
            'estado' => $request->estado
        ]);

        return response()->json([
            'message' => 'Producción actualizada correctamente',
            'data' => $produccion
        ]);
    }

    public function eliminar($id)
    {
        $usuario = request()->user();

        $consulta = Produccion::query()
            ->where('id_produccion', '=', $id);

        if ($usuario->rol !== 'Administrador') {
            $consulta->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        //$produccion = $consulta->first();
        $produccion = Produccion::WhereKey($id)->first();

        if (!$produccion) {
            return response()->json([
                'message' => 'Producción no encontrada'
            ], 404);
        }

        $produccion->delete();

        return response()->json([
            'message' => 'Producción eliminada correctamente'
        ]);
    }
}
