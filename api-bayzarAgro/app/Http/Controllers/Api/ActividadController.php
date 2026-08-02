<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\Cultivo;
use App\Models\Inventario;
use Illuminate\Http\Request;

class ActividadController extends Controller
{
    // LISTAR
    public function listar()
    {
        $usuario = request()->user();

        if ($usuario->rol === 'Administrador') {

            return response()->json(
                Actividad::with([
                    'cultivo.finca',
                    'inventario.plaguicida',
                    'inventario.fertilizante',
                ])
                    ->orderBy('fecha_programada', 'asc')
                    ->get()
            );
        }

        return response()->json(
            Actividad::whereHas('cultivo.finca', function ($query) use ($usuario) {

                $query->where(
                    'id_usuario',
                    $usuario->id_usuario
                );

            })
                ->with([
                    'cultivo.finca',
                    'inventario.plaguicida',
                    'inventario.fertilizante',
                ])
                ->orderBy('fecha_programada', 'asc')
                ->get()
        );
    }

    // CONSULTAR
    public function consultar($id)
    {
        $usuario = request()->user();

        $actividad = Actividad::with([
            'cultivo.finca',
            'inventario',
        ])
            ->whereKey($id)
            ->first();

        if (! $actividad) {

            return response()->json([
                'message' => 'Actividad no encontrada',
            ], 404);
        }

        if (
            $usuario->rol !== 'Administrador'
            &&
            $actividad->cultivo?->finca?->id_usuario !== $usuario->id_usuario
        ) {

            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        return response()->json($actividad);
    }

    // GUARDAR
    public function guardar(Request $request)
    {
        $request->validate([

            'id_cultivo' => 'required|integer|exists:tbl_cultivo,id_cultivo',

            'id_inventario' => 'nullable|integer|exists:tbl_inventario,id_inventario',

            'tipo_actividad' => 'required|max:50',

            'fecha_programada' => 'required|date',

            'fecha_realizacion' => 'nullable|date|after_or_equal:fecha_programada',

            'estado_actividad' => 'required|max:30',

            'prioridad' => 'required|max:20',

            'descripcion' => 'nullable|max:255',

            'cantidad_producto' => 'nullable|numeric|min:0',

            'unidad_producto' => 'nullable|max:30',

            'responsable' => 'nullable|max:100',

            'observaciones' => 'nullable|max:255',

            'estado' => 'required|boolean',
        ]);

        $usuario = request()->user();

        $cultivo = Cultivo::with('finca')
            ->whereKey($request->id_cultivo)
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

        if ($request->id_inventario) {

            $inventario = Inventario::whereKey(
                $request->id_inventario
            )->first();

            if (! $inventario) {

                return response()->json([
                    'message' => 'Producto de inventario no encontrado',
                ], 404);
            }

            if (
                $usuario->rol !== 'Administrador'
                &&
                $inventario->id_usuario !== $usuario->id_usuario
            ) {

                return response()->json([
                    'message' => 'No autorizado',
                ], 403);
            }
        }

        $actividad = Actividad::create([

            'id_cultivo' => $request->id_cultivo,

            'id_inventario' => $request->id_inventario,

            'tipo_actividad' => $request->tipo_actividad,

            'fecha_programada' => $request->fecha_programada,

            'fecha_realizacion' => $request->fecha_realizacion,

            'estado_actividad' => $request->estado_actividad,

            'prioridad' => $request->prioridad,

            'descripcion' => $request->descripcion,

            'cantidad_producto' => $request->cantidad_producto,

            'unidad_producto' => $request->unidad_producto,

            'responsable' => $request->responsable,

            'observaciones' => $request->observaciones,

            'estado' => $request->estado,
        ]);

        return response()->json([
            'message' => 'Actividad guardada correctamente',
            'actividad' => $actividad,
        ]);
    }

    // ACTUALIZAR
    public function actualizar(Request $request, $id)
    {
        $request->validate([

            'id_cultivo' => 'required|integer|exists:tbl_cultivo,id_cultivo',

            'id_inventario' => 'nullable|integer|exists:tbl_inventario,id_inventario',

            'tipo_actividad' => 'required|max:50',

            'fecha_programada' => 'required|date',

            'fecha_realizacion' => 'nullable|date|after_or_equal:fecha_programada',

            'estado_actividad' => 'required|max:30',

            'prioridad' => 'required|max:20',

            'descripcion' => 'nullable|max:255',

            'cantidad_producto' => 'nullable|numeric|min:0',

            'unidad_producto' => 'nullable|max:30',

            'responsable' => 'nullable|max:100',

            'observaciones' => 'nullable|max:255',

            'estado' => 'required|boolean',
        ]);

        $usuario = request()->user();

        $actividad = Actividad::with('cultivo.finca')
            ->whereKey($id)
            ->first();

        if (! $actividad) {

            return response()->json([
                'message' => 'Actividad no encontrada',
            ], 404);
        }

        if (
            $usuario->rol !== 'Administrador'
            &&
            $actividad->cultivo?->finca?->id_usuario !== $usuario->id_usuario
        ) {

            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        $cultivo = Cultivo::with('finca')
            ->whereKey($request->id_cultivo)
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

        if ($request->id_inventario) {

            $inventario = Inventario::whereKey(
                $request->id_inventario
            )->first();

            if (! $inventario) {

                return response()->json([
                    'message' => 'Producto de inventario no encontrado',
                ], 404);
            }

            if (
                $usuario->rol !== 'Administrador'
                &&
                $inventario->id_usuario !== $usuario->id_usuario
            ) {

                return response()->json([
                    'message' => 'No autorizado',
                ], 403);
            }
        }

        $actividad->update([

            'id_cultivo' => $request->id_cultivo,

            'id_inventario' => $request->id_inventario,

            'tipo_actividad' => $request->tipo_actividad,

            'fecha_programada' => $request->fecha_programada,

            'fecha_realizacion' => $request->fecha_realizacion,

            'estado_actividad' => $request->estado_actividad,

            'prioridad' => $request->prioridad,

            'descripcion' => $request->descripcion,

            'cantidad_producto' => $request->cantidad_producto,

            'unidad_producto' => $request->unidad_producto,

            'responsable' => $request->responsable,

            'observaciones' => $request->observaciones,

            'estado' => $request->estado,
        ]);

        return response()->json([
            'message' => 'Actividad actualizada correctamente',
            'actividad' => $actividad,
        ]);
    }

    // ELIMINAR
    public function eliminar($id)
    {
        $usuario = request()->user();

        $actividad = Actividad::with('cultivo.finca')->whereKey($id)->first();

        if (! $actividad) {

            return response()->json([
                'message' => 'Actividad no encontrada',
            ], 404);
        }

        if (
            $usuario->rol !== 'Administrador'
            &&
            $actividad->cultivo?->finca?->id_usuario !== $usuario->id_usuario
        ) {

            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        $actividad->delete();

        return response()->json([
            'message' => 'Actividad eliminada correctamente',
        ]);
    }
}
