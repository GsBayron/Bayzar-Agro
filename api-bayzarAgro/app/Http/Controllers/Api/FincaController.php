<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Finca;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
        if (! $finca) {

            return response()->json([
                'message' => 'Finca no encontrada',
            ], 404);
        }

        // Validar permisos agricultor
        if (
            $usuario->rol !== 'Administrador'
            &&
            $finca->id_usuario !== $usuario->id_usuario
        ) {

            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        return response()->json($finca);
    }

    // GUARDAR
    public function guardar(Request $request)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:100',
            'ubicacion' => 'nullable|string|max:200',
            'provincia' => 'nullable|string|max:80',
            'canton' => 'nullable|string|max:80',
            'distrito' => 'nullable|string|max:80',
            'latitud' => 'nullable|numeric|between:-90,90',
            'longitud' => 'nullable|numeric|between:-180,180',
            'area' => 'nullable|numeric|min:0',
            'unidad_area' => 'nullable|string|max:20',
            'descripcion' => 'nullable|string|max:500',
            'estado' => 'required|boolean',
        ]);

        $usuario = request()->user();

        $finca = DB::transaction(function () use ($usuario, $datos) {
            if ($usuario->rol !== 'Administrador') {
                $usuarioBloqueado = Usuario::with('plan')
                    ->whereKey($usuario->id_usuario)
                    ->lockForUpdate()
                    ->firstOrFail();
                $limite = $usuarioBloqueado->plan?->limite_fincas;

                if (
                    $limite !== null
                    && Finca::where('id_usuario', $usuario->id_usuario)->count() >= $limite
                ) {
                    throw ValidationException::withMessages([
                        'plan' => 'Ha alcanzado el límite de fincas de su plan.',
                    ]);
                }
            }

            return Finca::create([
                'id_usuario' => $usuario->id_usuario,
                ...$datos,
            ]);
        });

        return response()->json([
            'message' => 'Finca guardada correctamente',
            'finca' => $finca,
        ]);
    }

    // ACTUALIZAR
    public function actualizar(
        Request $request,
        $id
    ) {

        $datos = $request->validate([
            'nombre' => 'required|string|max:100',
            'ubicacion' => 'nullable|string|max:200',
            'provincia' => 'nullable|string|max:80',
            'canton' => 'nullable|string|max:80',
            'distrito' => 'nullable|string|max:80',
            'latitud' => 'nullable|numeric|between:-90,90',
            'longitud' => 'nullable|numeric|between:-180,180',
            'area' => 'nullable|numeric|min:0',
            'unidad_area' => 'nullable|string|max:20',
            'descripcion' => 'nullable|string|max:500',
            'estado' => 'required|boolean',
        ]);

        $usuario = request()->user();

        $finca = Finca::query()->whereKey($id)->first();

        // Validar existencia
        if (! $finca) {

            return response()->json([
                'message' => 'Finca no encontrada',
            ], 404);
        }

        // Validar permisos agricultor
        if (
            $usuario->rol !== 'Administrador'
            &&
            $finca->id_usuario !== $usuario->id_usuario
        ) {

            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        $finca->update($datos);

        return response()->json([
            'message' => 'Finca actualizada correctamente',
            'finca' => $finca,
        ]);
    }

    // ELIMINAR

    public function eliminar($id)
    {
        $usuario = request()->user();
        $finca = Finca::whereKey($id)->first();

        if (! $finca) {
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

        $finca->delete();

        return response()->json([
            'message' => 'Finca eliminada correctamente',
        ]);
    }
}
