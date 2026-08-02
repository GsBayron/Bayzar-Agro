<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\Costo;
use App\Models\Cultivo;
use App\Models\Finca;
use Illuminate\Http\Request;

class CostoController extends Controller
{
    public function listar()
    {
        $usuario = request()->user();

        $consulta = Costo::with([
            'usuario',
            'finca',
            'cultivo',
            'actividad',
        ])
            ->orderBy('fecha', 'desc')
            ->orderBy('id_costo', 'desc');

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

        $consulta = Costo::with([
            'usuario',
            'finca',
            'cultivo',
            'actividad',
        ])
            ->where('id_costo', '=', $id);

        if ($usuario->rol !== 'Administrador') {
            $consulta->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        $costo = $consulta->first();

        if (! $costo) {
            return response()->json([
                'message' => 'Costo no encontrado',
            ], 404);
        }

        return response()->json($costo);
    }

    public function guardar(Request $request)
    {
        $usuario = $request->user();

        $request->validate([
            'id_finca' => 'nullable|integer|exists:tbl_finca,id_finca',
            'id_cultivo' => 'nullable|integer|exists:tbl_cultivo,id_cultivo',
            'id_actividad' => 'nullable|integer|exists:tbl_actividad,id_actividad',

            'tipo_costo' => 'required|string|max:80',
            'descripcion' => 'required|string|max:255',

            'cantidad_personas' => 'nullable|integer|min:0',
            'horas_trabajadas' => 'nullable|numeric|min:0',
            'costo_por_hora' => 'nullable|numeric|min:0',

            'monto' => 'required|numeric|min:0',
            'fecha' => 'required|date',
            'observaciones' => 'nullable|string',
            'estado' => 'required|boolean',
        ]);

        if ($respuesta = $this->validarRelaciones($request)) {
            return $respuesta;
        }

        $costo = Costo::create([
            'id_usuario' => $usuario->id_usuario,
            'id_finca' => $request->id_finca,
            'id_cultivo' => $request->id_cultivo,
            'id_actividad' => $request->id_actividad,

            'tipo_costo' => $request->tipo_costo,
            'descripcion' => $request->descripcion,

            'cantidad_personas' => $request->cantidad_personas,
            'horas_trabajadas' => $request->horas_trabajadas,
            'costo_por_hora' => $request->costo_por_hora,

            'monto' => $request->monto,
            'fecha' => $request->fecha,
            'observaciones' => $request->observaciones,
            'estado' => $request->estado,
        ]);

        return response()->json([
            'message' => 'Costo registrado correctamente',
            'data' => $costo,
        ], 201);
    }

    public function actualizar(Request $request, $id)
    {
        $usuario = $request->user();

        $consulta = Costo::query()
            ->where('id_costo', '=', $id);

        if ($usuario->rol !== 'Administrador') {
            $consulta->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        $costo = $consulta->first();

        if (! $costo) {
            return response()->json([
                'message' => 'Costo no encontrado',
            ], 404);
        }

        $request->validate([
            'id_finca' => 'nullable|integer|exists:tbl_finca,id_finca',
            'id_cultivo' => 'nullable|integer|exists:tbl_cultivo,id_cultivo',
            'id_actividad' => 'nullable|integer|exists:tbl_actividad,id_actividad',

            'tipo_costo' => 'required|string|max:80',
            'descripcion' => 'required|string|max:255',

            'cantidad_personas' => 'nullable|integer|min:0',
            'horas_trabajadas' => 'nullable|numeric|min:0',
            'costo_por_hora' => 'nullable|numeric|min:0',

            'monto' => 'required|numeric|min:0',
            'fecha' => 'required|date',
            'observaciones' => 'nullable|string',
            'estado' => 'required|boolean',
        ]);

        if ($respuesta = $this->validarRelaciones($request)) {
            return $respuesta;
        }

        $costo->update([
            'id_finca' => $request->id_finca,
            'id_cultivo' => $request->id_cultivo,
            'id_actividad' => $request->id_actividad,

            'tipo_costo' => $request->tipo_costo,
            'descripcion' => $request->descripcion,

            'cantidad_personas' => $request->cantidad_personas,
            'horas_trabajadas' => $request->horas_trabajadas,
            'costo_por_hora' => $request->costo_por_hora,

            'monto' => $request->monto,
            'fecha' => $request->fecha,
            'observaciones' => $request->observaciones,
            'estado' => $request->estado,
        ]);

        return response()->json([
            'message' => 'Costo actualizado correctamente',
            'data' => $costo,
        ]);
    }

    public function eliminar($id)
    {
        $usuario = request()->user();

        $consulta = Costo::query()
            ->where('id_costo', '=', $id);

        if ($usuario->rol !== 'Administrador') {
            $consulta->where(
                'id_usuario',
                '=',
                $usuario->id_usuario
            );
        }

        $costo = $consulta->first();
        if (! $costo) {
            return response()->json([
                'message' => 'Costo no encontrado',
            ], 404);
        }

        $costo->delete();

        return response()->json([
            'message' => 'Costo eliminado correctamente',
        ]);
    }

    private function validarRelaciones(Request $request)
    {
        $usuario = $request->user();
        $finca = $request->id_finca
            ? Finca::whereKey($request->id_finca)->first()
            : null;
        $cultivo = $request->id_cultivo
            ? Cultivo::with('finca')->whereKey($request->id_cultivo)->first()
            : null;
        $actividad = $request->id_actividad
            ? Actividad::with('cultivo.finca')->whereKey($request->id_actividad)->first()
            : null;

        if ($usuario->rol !== 'Administrador') {
            if ($finca && $finca->id_usuario !== $usuario->id_usuario) {
                return response()->json([
                    'message' => 'No autorizado para esta finca',
                ], 403);
            }

            if ($cultivo && $cultivo->finca?->id_usuario !== $usuario->id_usuario) {
                return response()->json([
                    'message' => 'No autorizado para este cultivo',
                ], 403);
            }

            if ($actividad && $actividad->cultivo?->finca?->id_usuario !== $usuario->id_usuario) {
                return response()->json([
                    'message' => 'No autorizado para esta actividad',
                ], 403);
            }
        }

        if ($finca && $cultivo && $cultivo->id_finca !== $finca->id_finca) {
            return response()->json([
                'message' => 'El cultivo no pertenece a la finca seleccionada',
            ], 422);
        }

        if ($cultivo && $actividad && $actividad->id_cultivo !== $cultivo->id_cultivo) {
            return response()->json([
                'message' => 'La actividad no pertenece al cultivo seleccionado',
            ], 422);
        }

        if (
            $finca
            && $actividad
            && $actividad->cultivo?->id_finca !== $finca->id_finca
        ) {
            return response()->json([
                'message' => 'La actividad no pertenece a la finca seleccionada',
            ], 422);
        }

        return null;
    }
}
