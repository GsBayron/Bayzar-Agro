<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cultivo;
use App\Models\Finca;
use Illuminate\Http\Request;

class CultivoController extends Controller
{
    // LISTAR
    public function listar()
    {
        $usuario = request()->user();

        // ADMINISTRADOR
        if ($usuario->rol === 'Administrador') {
            $datos = Cultivo::with('finca')
                ->orderBy('id_cultivo', 'desc')
                ->get();

            return response()->json($datos);
        }
        // AGRICULTOR
        $datos = Cultivo::whereHas('finca', function ($query) use ($usuario) {
            $query->where(
                'id_usuario',
                $usuario->id_usuario
            );
        })
            ->with('finca')
            ->orderBy('id_cultivo', 'desc')
            ->get();

        return response()->json($datos);
    }

    public function consultar($id)
    {
        $usuario = request()->user();

        $cultivo = Cultivo::with('finca')
            ->whereKey($id)
            ->first();

        if (! $cultivo) {
            return response()->json([
                'message' => 'Cultivo no encontrado',
            ], 404);
        }

        if (
            $usuario->rol !== 'Administrador'
            &&
            $cultivo->finca?->id_usuario !== $usuario->id_usuario
        ) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        return response()->json($cultivo);
    }

    // GUARDAR
    public function guardar(Request $request)
    {
        $request->validate([
            'id_finca' => 'required|integer|exists:tbl_finca,id_finca',

            'nombre' => 'required|max:100',

            'tipo_cultivo' => 'nullable|max:80',

            'variedad' => 'nullable|max:100',

            'fecha_siembra' => 'nullable|date',

            'fecha_estimada_cosecha' => 'nullable|date|after_or_equal:fecha_siembra',

            'area_sembrada' => 'nullable|numeric|min:0',

            'cantidad_plantas' => 'nullable|integer|min:0',

            'distancia_siembra' => 'nullable|max:80',

            'unidad_area' => 'nullable|max:20',

            'estado_cultivo' => 'required|max:30',

            'descripcion' => 'nullable|max:255',

            'estado' => 'required|boolean',
        ]);

        $usuario = request()->user();

        $finca = Finca::whereKey($request->id_finca)
            ->first();

        if (! $finca) {
            return \response()->json([
                'message' => 'Finca no encontrada',
            ], 404);
        }

        // Validar que el agricultor solo guarde sus propias fincas
        if (
            $usuario->rol !== 'Administrador'
            &&
            $finca->id_usuario !== $usuario->id_usuario
        ) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        $cultivo = Cultivo::create([
            'id_finca' => $request->id_finca,

            'nombre' => $request->nombre,

            'tipo_cultivo' => $request->tipo_cultivo,

            'variedad' => $request->variedad,

            'fecha_siembra' => $request->fecha_siembra,

            'fecha_estimada_cosecha' => $request->fecha_estimada_cosecha,

            'area_sembrada' => $request->area_sembrada,

            'cantidad_plantas' => $request->cantidad_plantas,

            'distancia_siembra' => $request->distancia_siembra,

            'unidad_area' => $request->unidad_area,

            'estado_cultivo' => $request->estado_cultivo,

            'descripcion' => $request->descripcion,

            'estado' => $request->estado,
        ]);

        return response()->json([
            'message' => 'Cultivo guardado correctamente',
            'cultivo' => $cultivo,
        ]);
    }

    // ACTUALIZAR
    public function actualizar(Request $request, $id)
    {
        $request->validate([
            'id_finca' => 'required|integer|exists:tbl_finca,id_finca',

            'nombre' => 'required|string|max:100',

            'tipo_cultivo' => 'nullable|string|max:100',

            'variedad' => 'nullable|string|max:100',

            'fecha_siembra' => 'nullable|date',

            'fecha_estimada_cosecha' => 'nullable|date|after_or_equal:fecha_siembra',

            'area_sembrada' => 'nullable|numeric|min:0',

            'cantidad_plantas' => 'nullable|integer|min:0',

            'distancia_siembra' => 'nullable|max:80',

            'unidad_area' => 'nullable|string|max:30',

            'estado_cultivo' => 'nullable|string|max:50',

            'descripcion' => 'nullable|string',

            'estado' => 'required|boolean',
        ]);

        $usuario = $request->user();

        $cultivo = Cultivo::with('finca')
            ->whereKey($id)
            ->first();

        if (! $cultivo) {
            return response()->json([
                'message' => 'Cultivo no encontrado',
            ], 404);
        }

        // Validar que el agricultor solo actualice cultivos de sus fincas
        if (
            $usuario->rol !== 'Administrador'
            &&
            $cultivo->finca?->id_usuario !== $usuario->id_usuario
        ) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        $fincaNueva = Finca::whereKey($request->id_finca)
            ->first();

        if (! $fincaNueva) {
            return response()->json([
                'message' => 'Finca no encontrada',
            ], 404);
        }

        // Validar que el agricultor no mueva el cultivo a una finca ajena
        if (
            $usuario->rol !== 'Administrador'
            &&
            $fincaNueva->id_usuario !== $usuario->id_usuario
        ) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        $cultivo->update([
            'id_finca' => $request->id_finca,

            'nombre' => $request->nombre,

            'tipo_cultivo' => $request->tipo_cultivo,

            'variedad' => $request->variedad,

            'fecha_siembra' => $request->fecha_siembra,

            'fecha_estimada_cosecha' => $request->fecha_estimada_cosecha,

            'area_sembrada' => $request->area_sembrada,

            'cantidad_plantas' => $request->cantidad_plantas,

            'distancia_siembra' => $request->distancia_siembra,

            'unidad_area' => $request->unidad_area,

            'estado_cultivo' => $request->estado_cultivo,

            'descripcion' => $request->descripcion,

            'estado' => $request->estado,
        ]);

        return response()->json([
            'message' => 'Cultivo actualizado correctamente',
            'cultivo' => $cultivo,
        ]);
    }

    // ELIMINAR
    public function eliminar($id)
    {
        $usuario = request()->user();

        $cultivo = Cultivo::with('finca')->whereKey($id)->first();

        if (! $cultivo) {
            return response()->json([
                'message' => 'Cultivo no encontrado',
            ], 404);
        }

        // Validar permisos de agricultor
        if (
            $usuario->rol !== 'Administrador'
            &&
            $cultivo->finca?->id_usuario !== $usuario->id_usuario
        ) {

            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        $cultivo->delete();

        return response()->json([
            'message' => 'Cultivo eliminado correctamente',
        ]);

    }
}
