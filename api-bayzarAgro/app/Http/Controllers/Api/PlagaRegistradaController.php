<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\PlagaRegistrada;

class PlagaRegistradaController extends Controller
{
    public function listar()
    {
        $usuario = request()->user();

        $consulta = PlagaRegistrada::query()
            ->orderBy('nombre_comun', 'asc');

        if ($usuario->rol !== 'Administrador') {
            $consulta->where('estado', '=', 1);
        }

        return response()->json(
            $consulta->get()
        );
    }

    public function consultar($id)
    {
        $usuario = request()->user();

        $consulta = PlagaRegistrada::query()
            ->where('id_plaga_registrada', '=', $id);

        if ($usuario->rol !== 'Administrador') {
            $consulta->where('estado', '=', 1);
        }

        $registro = $consulta->first();

        if (!$registro) {
            return response()->json([
                'message' => 'Plaga registrada no encontrada'
            ], 404);
        }

        return response()->json($registro);
    }

    public function guardar(Request $request)
    {
        $request->validate([
            'nombre_comun' => 'required|string|max:150',
            'nombre_cientifico' => 'nullable|string|max:150',
            'tipo_plaga' => 'nullable|string|max:100',
            'descripcion' => 'nullable|string',
            'fuente' => 'nullable|string|max:255',
            'estado' => 'required|boolean'
        ]);

        $registro = PlagaRegistrada::create([
            'nombre_comun' => $request->nombre_comun,
            'nombre_cientifico' => $request->nombre_cientifico,
            'tipo_plaga' => $request->tipo_plaga,
            'descripcion' => $request->descripcion,
            'fuente' => $request->fuente,
            'estado' => $request->estado
        ]);

        return response()->json([
            'message' => 'Plaga registrada correctamente',
            'data' => $registro
        ], 201);
    }

    public function actualizar(Request $request, $id)
    {
        $registro = PlagaRegistrada::query()
            ->where('id_plaga_registrada', '=', $id)
            ->first();

        if (!$registro) {
            return response()->json([
                'message' => 'Plaga registrada no encontrada'
            ], 404);
        }

        $request->validate([
            'nombre_comun' => 'required|string|max:150',
            'nombre_cientifico' => 'nullable|string|max:150',
            'tipo_plaga' => 'nullable|string|max:100',
            'descripcion' => 'nullable|string',
            'fuente' => 'nullable|string|max:255',
            'estado' => 'required|boolean'
        ]);

        $registro->update([
            'nombre_comun' => $request->nombre_comun,
            'nombre_cientifico' => $request->nombre_cientifico,
            'tipo_plaga' => $request->tipo_plaga,
            'descripcion' => $request->descripcion,
            'fuente' => $request->fuente,
            'estado' => $request->estado
        ]);

        return response()->json([
            'message' => 'Plaga actualizada correctamente',
            'data' => $registro
        ]);
    }

    public function eliminar($id)
    {
        $registro = PlagaRegistrada::whereKey($id)->first();
        if (!$registro) {
            return response()->json([
                'message' => 'Plaga registrada no encontrada'
            ], 404);
        }

        $registro->delete();

        return response()->json([
            'message' => 'Plaga eliminada correctamente'
        ]);
    }
}