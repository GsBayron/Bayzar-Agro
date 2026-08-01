<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Finca;
use Illuminate\Database\QueryException;

class FincaController extends Controller
{
    // LISTAR
    public function listar()
    {
        $usuario = request()->user();

        // ADMINISTRADOR
        if ($usuario->rol === 'Administrador') {

            $datos = Finca::with('usuario')
                ->orderBy('id_finca', 'desc')
                ->get();

            return response()->json($datos);
        }

         // AGRICULTOR
        $datos = Finca::query()
            ->where('id_usuario', $usuario->id_usuario)
            ->with('usuario')
            ->orderBy('id_finca', 'desc')
            ->get();
        return response()->json($datos);
    }

    // CONSULTAR
    public function consultar($id)
    {
        $usuario = request()->user();

        $finca = Finca::with('usuario')->whereKey($id)->first();

        // Validar existencia
        if (!$finca) {

            return response()->json([
                'message' => 'Finca no encontrada'
            ], 404);
        }

        // Validar permisos agricultor
        if (
            $usuario->rol === 'Agricultor'
            &&
            $finca->id_usuario !== $usuario->id_usuario
        ) {

            return response()->json([
                'message' => 'No autorizado'
            ], 403);
        }

        return response()->json($finca);
    }

    // GUARDAR
    public function guardar(Request $request)
    {
        $request->validate([

            'nombre' => 'required|max:100',

            'ubicacion' => 'nullable|max:200',

            'provincia' => 'nullable|max:50',

            'canton' => 'nullable|max:50',

            'distrito' => 'nullable|max:50', 

            'latitud' => 'nullable|numeric',

            'longitud' => 'nullable|numeric',

            'area' => 'nullable|numeric',

            'cantidad_plantas' => 'nullable|integer|min:0',

            'distancia_siembra' => 'nullable|string|max:80',

            'unidad_area' => 'nullable|max:20',

            'descripcion' => 'nullable|max:255',

            'estado' => 'required|boolean'
        ]);

        $usuario = request()->user();

        $finca = Finca::create([

            'id_usuario' => $usuario->id_usuario,

            'nombre' => $request->nombre,

            'ubicacion' => $request->ubicacion,

            'provincia' => $request->provincia,

            'canton' => $request->canton,

            'distrito' => $request->distrito,

            'latitud' => $request->latitud,
            
            'longitud' => $request->longitud,

            'area' => $request->area,

            'cantidad_plantas' => $request->cantidad_plantas,

            'distancia_siembra' => $request->distancia_siembra,

            'unidad_area' => $request->unidad_area,

            'descripcion' => $request->descripcion,

            'estado' => $request->estado
        ]);

        return response()->json([
            'message' => 'Finca guardada correctamente',
            'finca' => $finca
        ]);
    }

    // ACTUALIZAR
    public function actualizar(
        Request $request,
        $id
    ) {

        $request->validate([

            'nombre' => 'required|max:100',

            'ubicacion' => 'nullable|max:200',

            'provincia' => 'nullable|max:50',

            'canton' => 'nullable|max:50',

            'distrito' => 'nullable|max:50',

            'latitud' => 'nullable|numeric',

            'longitud' => 'nullable|numeric',

            'area' => 'nullable|numeric',

            'cantidad_plantas' => 'nullable|integer|min:0',

            'distancia_siembra' => 'nullable|string|max:80',

            'unidad_area' => 'nullable|max:20',

            'descripcion' => 'nullable|max:255',

            'estado' => 'required|boolean'
        ]);

        $usuario = request()->user();

        $finca = Finca::query()->whereKey($id)->first();

        // Validar existencia
        if (!$finca) {

            return response()->json([
                'message' => 'Finca no encontrada'
            ], 404);
        }

        // Validar permisos agricultor
        if (
            $usuario->rol === 'Agricultor'
            &&
            $finca->id_usuario !== $usuario->id_usuario
        ) {

            return response()->json([
                'message' => 'No autorizado'
            ], 403);
        }

        $finca->update([

            'nombre' => $request->nombre,

            'ubicacion' => $request->ubicacion,

            'provincia' => $request->provincia,

            'canton' => $request->canton,

            'distrito' => $request->distrito,
            
            'latitud' => $request->latitud,
            
            'longitud' => $request->longitud,

            'area' => $request->area,

            'cantidad_plantas' => $request->cantidad_plantas,

            'distancia_siembra' => $request->distancia_siembra,

            'unidad_area' => $request->unidad_area,

            'descripcion' => $request->descripcion,

            'estado' => $request->estado
        ]);

        return response()->json([
            'message' => 'Finca actualizada correctamente',
            'finca' => $finca
        ]);
    }

    // ELIMINAR


    public function eliminar($id)
    {
        $usuario = request()->user();
        $finca = Finca::whereKey($id)->first();

        if (!$finca) {
            return response()->json([
                'message' => 'Finca no encontrada',
            ], 404);
        }

        if (
            $usuario->rol !== 'Administrador' &&
            $finca->id_usuario !== $usuario->id_usuario
        ) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        try {
            $finca->delete();

            return response()->json([
                'message' => 'Finca eliminada correctamente',
            ]);
        } catch (QueryException $exception) {
            return response()->json([
                'message' => 'No se puede eliminar la finca porque tiene registros relacionados',
            ], 409);
        }
    }
}
