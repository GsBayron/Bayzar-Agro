<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\PlaguicidaRegistrado;

class PlaguicidaRegistradoController extends Controller
{
    public function listar()
    {
        $usuario = request()->user();

        $consulta = PlaguicidaRegistrado::query()
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

        $consulta = PlaguicidaRegistrado::query()
            ->where('id_plaguicida_registrado', '=', $id);

        if ($usuario->rol !== 'Administrador') {
            $consulta->where('estado', '=', 1);
        }

        $registro = $consulta->first();

        if (!$registro) {
            return response()->json([
                'message' => 'Plaguicida registrado no encontrado'
            ], 404);
        }

        return response()->json($registro);
    }

    public function guardar(Request $request)
    {
        $request->validate([
            'numero_registro' => 'nullable|string|max:100',
            'nombre_comercial' => 'required|string|max:200',
            'ingrediente_activo' => 'nullable|string|max:255',
            'tipo_plaguicida' => 'nullable|string|max:100',
            'cultivo_autorizado' => 'nullable|string|max:255',
            'plaga_objetivo' => 'nullable|string|max:255',
            'titular' => 'nullable|string|max:255',
            'estado_registro' => 'nullable|string|max:100',
            'fuente' => 'nullable|string|max:255',
            'estado' => 'required|boolean'
        ]);

        $registro = PlaguicidaRegistrado::create([
            'numero_registro' => $request->numero_registro,
            'nombre_comercial' => $request->nombre_comercial,
            'ingrediente_activo' => $request->ingrediente_activo,
            'tipo_plaguicida' => $request->tipo_plaguicida,
            'cultivo_autorizado' => $request->cultivo_autorizado,
            'plaga_objetivo' => $request->plaga_objetivo,
            'titular' => $request->titular,
            'estado_registro' => $request->estado_registro,
            'fuente' => $request->fuente,
            'estado' => $request->estado
        ]);

        return response()->json([
            'message' => 'Plaguicida registrado correctamente',
            'data' => $registro
        ], 201);
    }

    public function actualizar(Request $request, $id)
    {
        $registro = PlaguicidaRegistrado::query()
            ->where('id_plaguicida_registrado', '=', $id)
            ->first();

        if (!$registro) {
            return response()->json([
                'message' => 'Plaguicida registrado no encontrado'
            ], 404);
        }

        $request->validate([
            'numero_registro' => 'nullable|string|max:100',
            'nombre_comercial' => 'required|string|max:200',
            'ingrediente_activo' => 'nullable|string|max:255',
            'tipo_plaguicida' => 'nullable|string|max:100',
            'cultivo_autorizado' => 'nullable|string|max:255',
            'plaga_objetivo' => 'nullable|string|max:255',
            'titular' => 'nullable|string|max:255',
            'estado_registro' => 'nullable|string|max:100',
            'fuente' => 'nullable|string|max:255',
            'estado' => 'required|boolean'
        ]);

        $registro->update([
            'numero_registro' => $request->numero_registro,
            'nombre_comercial' => $request->nombre_comercial,
            'ingrediente_activo' => $request->ingrediente_activo,
            'tipo_plaguicida' => $request->tipo_plaguicida,
            'cultivo_autorizado' => $request->cultivo_autorizado,
            'plaga_objetivo' => $request->plaga_objetivo,
            'titular' => $request->titular,
            'estado_registro' => $request->estado_registro,
            'fuente' => $request->fuente,
            'estado' => $request->estado
        ]);

        return response()->json([
            'message' => 'Plaguicida actualizado correctamente',
            'data' => $registro
        ]);
    }

    public function eliminar($id)
    {
         $registro = PlaguicidaRegistrado::whereKey($id)->firt();

        if (!$registro) {
            return response()->json([
                'message' => 'Plaguicida registrado no encontrado'
            ], 404);
        }

        $registro->delete();

        return response()->json([
            'message' => 'Plaguicida eliminado correctamente'
        ]);
    }
}