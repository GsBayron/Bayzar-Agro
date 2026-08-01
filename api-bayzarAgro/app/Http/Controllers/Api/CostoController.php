<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Costo;
use App\Models\Finca;
use App\Models\Cultivo;
use App\Models\Actividad;

class CostoController extends Controller
{
    public function listar()
    {
        $usuario = request()->user();

        $consulta = Costo::with([
            'usuario',
            'finca',
            'cultivo',
            'actividad'
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
            'actividad'
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

        if (!$costo) {
            return response()->json([
                'message' => 'Costo no encontrado'
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
            'estado' => 'required|boolean'
        ]);

        if (
            $usuario->rol === 'Agricultor'
            &&
            $request->id_finca
        ) {
            $finca = Finca::query()
                ->where('id_finca', '=', $request->id_finca)
                ->where('id_usuario', '=', $usuario->id_usuario)
                ->first();

            if (!$finca) {
                return response()->json([
                    'message' => 'No autorizado para esta finca'
                ], 403);
            }
        }

        if (
            $usuario->rol === 'Agricultor'
            &&
            $request->id_cultivo
        ) {
            $cultivo = Cultivo::query()
                ->where('id_cultivo', '=', $request->id_cultivo)
                ->whereHas('finca', function ($query) use ($usuario) {
                    $query->where(
                        'id_usuario',
                        '=',
                        $usuario->id_usuario
                    );
                })
                ->first();

            if (!$cultivo) {
                return response()->json([
                    'message' => 'No autorizado para este cultivo'
                ], 403);
            }
        }

        if (
            $usuario->rol === 'Agricultor'
            &&
            $request->id_actividad
        ) {
            $actividad = Actividad::query()
                ->where('id_actividad', '=', $request->id_actividad)
                ->whereHas('cultivo.finca', function ($query) use ($usuario) {
                    $query->where(
                        'id_usuario',
                        '=',
                        $usuario->id_usuario
                    );
                })
                ->first();

            if (!$actividad) {
                return response()->json([
                    'message' => 'No autorizado para esta actividad'
                ], 403);
            }
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
            'estado' => $request->estado
        ]);

        return response()->json([
            'message' => 'Costo registrado correctamente',
            'data' => $costo
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

        if (!$costo) {
            return response()->json([
                'message' => 'Costo no encontrado'
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
            'estado' => 'required|boolean'
        ]);

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
            'estado' => $request->estado
        ]);

        return response()->json([
            'message' => 'Costo actualizado correctamente',
            'data' => $costo
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

        //$costo = $consulta->first();
        $costo = Costo::WhereKey($id)->first();
        if (!$costo) {
            return response()->json([
                'message' => 'Costo no encontrado'
            ], 404);
        }

        $costo->delete();

        return response()->json([
            'message' => 'Costo eliminado correctamente'
        ]);
    }
}
