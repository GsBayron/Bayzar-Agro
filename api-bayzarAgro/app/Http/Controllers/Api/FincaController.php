<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Finca;

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

            'area' => 'nullable|numeric',

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

            'area' => $request->area,

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

            'area' => 'nullable|numeric',

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

            'area' => $request->area,

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

        $finca->delete();

        return response()->json([
            'message' => 'Finca eliminada correctamente'
        ]);
    }
}
