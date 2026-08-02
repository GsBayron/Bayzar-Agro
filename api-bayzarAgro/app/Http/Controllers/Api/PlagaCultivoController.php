<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cultivo;
use App\Models\PlagaCultivo;
use Illuminate\Http\Request;

class PlagaCultivoController extends Controller
{
    public function listar()
    {
        $usuario = request()->user();

        if ($usuario->rol === 'Administrador') {
            return response()->json(
                PlagaCultivo::with(['cultivo.finca', 'plaga'])
                    ->orderBy('id_plaga_cultivo', 'desc')
                    ->get()
            );
        }

        return response()->json(
            PlagaCultivo::whereHas('cultivo.finca', function ($query) use ($usuario) {
                $query->where('id_usuario', $usuario->id_usuario);
            })
                ->with(['cultivo.finca', 'plaga'])
                ->orderBy('id_plaga_cultivo', 'desc')
                ->get()
        );
    }

    public function consultar($id)
    {
        $usuario = request()->user();

        $registro = PlagaCultivo::with(['cultivo.finca', 'plaga'])
            ->whereKey($id)
            ->first();

        if (! $registro) {
            return response()->json([
                'message' => 'Registro de plaga no encontrado',
            ], 404);
        }

        if (
            $usuario->rol !== 'Administrador'
            &&
            $registro->cultivo?->finca?->id_usuario !== $usuario->id_usuario
        ) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        return response()->json($registro);
    }

    public function guardar(Request $request)
    {
        $request->validate([
            'id_cultivo' => 'required|integer|exists:tbl_cultivo,id_cultivo',
            'id_plaga_registrada' => 'nullable|integer|exists:tbl_plaga_registrada,id_plaga_registrada',
            'nombre_manual' => 'nullable|required_without:id_plaga_registrada|string|max:100',
            'tipo_plaga_manual' => 'nullable|max:50',
            'fecha_deteccion' => 'required|date',
            'nivel_riesgo' => 'required|max:30',
            'estado_plaga' => 'required|max:30',
            'descripcion' => 'nullable|max:255',
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

        $registro = PlagaCultivo::create([
            'id_cultivo' => $request->id_cultivo,
            'id_plaga_registrada' => $request->id_plaga_registrada,
            'nombre_manual' => $request->nombre_manual,
            'tipo_plaga_manual' => $request->tipo_plaga_manual,
            'fecha_deteccion' => $request->fecha_deteccion,
            'nivel_riesgo' => $request->nivel_riesgo,
            'estado_plaga' => $request->estado_plaga,
            'descripcion' => $request->descripcion,
            'observaciones' => $request->observaciones,
            'estado' => $request->estado,
        ]);

        return response()->json([
            'message' => 'Plaga registrada correctamente',
            'plaga_cultivo' => $registro,
        ]);
    }

    public function actualizar(Request $request, $id)
    {
        $request->validate([
            'id_cultivo' => 'required|integer|exists:tbl_cultivo,id_cultivo',
            'id_plaga_registrada' => 'nullable|integer|exists:tbl_plaga_registrada,id_plaga_registrada',
            'nombre_manual' => 'nullable|required_without:id_plaga_registrada|string|max:100',
            'tipo_plaga_manual' => 'nullable|max:50',
            'fecha_deteccion' => 'required|date',
            'nivel_riesgo' => 'required|max:30',
            'estado_plaga' => 'required|max:30',
            'descripcion' => 'nullable|max:255',
            'observaciones' => 'nullable|max:255',
            'estado' => 'required|boolean',
        ]);

        $usuario = request()->user();

        $registro = PlagaCultivo::with('cultivo.finca')
            ->whereKey($id)
            ->first();

        if (! $registro) {
            return response()->json([
                'message' => 'Registro de plaga no encontrado',
            ], 404);
        }

        if (
            $usuario->rol !== 'Administrador'
            &&
            $registro->cultivo?->finca?->id_usuario !== $usuario->id_usuario
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

        $registro->update([
            'id_cultivo' => $request->id_cultivo,
            'id_plaga_registrada' => $request->id_plaga_registrada,
            'nombre_manual' => $request->nombre_manual,
            'tipo_plaga_manual' => $request->tipo_plaga_manual,
            'fecha_deteccion' => $request->fecha_deteccion,
            'nivel_riesgo' => $request->nivel_riesgo,
            'estado_plaga' => $request->estado_plaga,
            'descripcion' => $request->descripcion,
            'observaciones' => $request->observaciones,
            'estado' => $request->estado,
        ]);

        return response()->json([
            'message' => 'Registro de plaga actualizado correctamente',
            'plaga_cultivo' => $registro,
        ]);
    }

    public function eliminar($id)
    {
        $usuario = request()->user();

        $registro = PlagaCultivo::with('cultivo.finca')->find($id);

        if (! $registro) {
            return response()->json([
                'message' => 'Registro de plaga no encontrado',
            ], 404);
        }

        if (
            $usuario->rol !== 'Administrador'
            &&
            $registro->cultivo?->finca?->id_usuario !== $usuario->id_usuario
        ) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        $registro->delete();

        return response()->json([
            'message' => 'Registro de plaga eliminado correctamente',
        ]);
    }
}
