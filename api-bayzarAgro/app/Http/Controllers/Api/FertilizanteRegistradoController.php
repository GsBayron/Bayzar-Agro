<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\FertilizanteRegistrado;

class FertilizanteRegistradoController extends Controller
{
    public function listar()
    {
        $usuario = request()->user();

        $consulta = FertilizanteRegistrado::query()
            ->orderBy('nombre_comercial', 'asc');

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

        $consulta = FertilizanteRegistrado::query()
            ->where('id_fertilizante_registrado', '=', $id);

        if ($usuario->rol !== 'Administrador') {
            $consulta->where('estado', '=', 1);
        }

        $registro = $consulta->first();

        if (!$registro) {
            return response()->json([
                'message' => 'Fertilizante registrado no encontrado'
            ], 404);
        }

        return response()->json($registro);
    }

    public function guardar(Request $request)
    {
        $request->validate([
            'numero_registro' => 'nullable|string|max:100',
            'nombre_comercial' => 'required|string|max:200',
            'composicion' => 'nullable|string|max:255',
            'tipo_fertilizante' => 'nullable|string|max:100',
            'fabricante' => 'nullable|string|max:255',
            'estado_registro' => 'nullable|string|max:100',
            'fuente' => 'nullable|string|max:255',
            'estado' => 'required|boolean'
        ]);

        $registro = FertilizanteRegistrado::create([
            'numero_registro' => $request->numero_registro,
            'nombre_comercial' => $request->nombre_comercial,
            'composicion' => $request->composicion,
            'tipo_fertilizante' => $request->tipo_fertilizante,
            'fabricante' => $request->fabricante,
            'estado_registro' => $request->estado_registro,
            'fuente' => $request->fuente,
            'estado' => $request->estado
        ]);

        return response()->json([
            'message' => 'Fertilizante registrado correctamente',
            'data' => $registro
        ], 201);
    }

    public function actualizar(Request $request, $id)
    {
        $registro = FertilizanteRegistrado::query()
            ->where('id_fertilizante_registrado', '=', $id)
            ->first();

        if (!$registro) {
            return response()->json([
                'message' => 'Fertilizante registrado no encontrado'
            ], 404);
        }

        $request->validate([
            'numero_registro' => 'nullable|string|max:100',
            'nombre_comercial' => 'required|string|max:200',
            'composicion' => 'nullable|string|max:255',
            'tipo_fertilizante' => 'nullable|string|max:100',
            'fabricante' => 'nullable|string|max:255',
            'estado_registro' => 'nullable|string|max:100',
            'fuente' => 'nullable|string|max:255',
            'estado' => 'required|boolean'
        ]);

        $registro->update([
            'numero_registro' => $request->numero_registro,
            'nombre_comercial' => $request->nombre_comercial,
            'composicion' => $request->composicion,
            'tipo_fertilizante' => $request->tipo_fertilizante,
            'fabricante' => $request->fabricante,
            'estado_registro' => $request->estado_registro,
            'fuente' => $request->fuente,
            'estado' => $request->estado
        ]);

        return response()->json([
            'message' => 'Fertilizante actualizado correctamente',
            'data' => $registro
        ]);
    }

    public function eliminar($id)
    {
        $registro = FertilizanteRegistrado::whereKey($id)->firt();

        if (!$registro) {
            return response()->json([
                'message' => 'Fertilizante registrado no encontrado'
            ], 404);
        }

        $registro->delete();

        return response()->json([
            'message' => 'Fertilizante eliminado correctamente'
        ]);
    }
}