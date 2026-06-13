<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Inventario;
use App\Models\Finca;

class InventarioController extends Controller
{
    public function listar()
    {
        $usuario = request()->user();

        if ($usuario->rol === 'Administrador') {
            return response()->json(
                Inventario::with(['usuario', 'finca', 'plaguicida', 'fertilizante'])
                    ->orderBy('id_inventario', 'desc')
                    ->get()
            );
        }

        return response()->json(
            Inventario::with(['usuario', 'finca', 'plaguicida', 'fertilizante'])
                ->where('id_usuario', $usuario->id_usuario)
                ->orderBy('id_inventario', 'desc')
                ->get()
        );
    }

    public function consultar($id)
    {
        $usuario = request()->user();

        $inventario = Inventario::with(['usuario', 'finca', 'plaguicida', 'fertilizante'])
            ->whereKey($id)
            ->first();

        if (!$inventario) {
            return response()->json([
                'message' => 'Inventario no encontrado'
            ], 404);
        }

        if (
            $usuario->rol === 'Agricultor'
            &&
            $inventario->id_usuario !== $usuario->id_usuario
        ) {
            return response()->json([
                'message' => 'No autorizado'
            ], 403);
        }

        return response()->json($inventario);
    }

    public function guardar(Request $request)
    {
        $request->validate([
            'id_finca' => 'nullable|integer',
            'tipo_producto' => 'required|max:50',
            'id_plaguicida_registrado' => 'nullable|integer',
            'id_fertilizante_registrado' => 'nullable|integer',
            'nombre_manual' => 'nullable|max:150',
            'descripcion_manual' => 'nullable|max:255',
            'cantidad' => 'required|numeric',
            'unidad_medida' => 'required|max:30',
            'fecha_compra' => 'nullable|date',
            'fecha_vencimiento' => 'nullable|date',
            'ubicacion' => 'nullable|max:150',
            'observaciones' => 'nullable|max:255',
            'estado' => 'required|boolean'
        ]);

        $usuario = request()->user();

        if ($request->id_finca) {
            $finca = Finca::whereKey($request->id_finca)->first();

            if (!$finca) {
                return response()->json([
                    'message' => 'Finca no encontrada'
                ], 404);
            }

            if (
                $usuario->rol === 'Agricultor'
                &&
                $finca->id_usuario !== $usuario->id_usuario
            ) {
                return response()->json([
                    'message' => 'No autorizado'
                ], 403);
            }
        }

        $inventario = Inventario::create([
            'id_usuario' => $usuario->id_usuario,
            'id_finca' => $request->id_finca,
            'tipo_producto' => $request->tipo_producto,
            'id_plaguicida_registrado' => $request->id_plaguicida_registrado,
            'id_fertilizante_registrado' => $request->id_fertilizante_registrado,
            'nombre_manual' => $request->nombre_manual,
            'descripcion_manual' => $request->descripcion_manual,
            'cantidad' => $request->cantidad,
            'unidad_medida' => $request->unidad_medida,
            'fecha_compra' => $request->fecha_compra,
            'fecha_vencimiento' => $request->fecha_vencimiento,
            'ubicacion' => $request->ubicacion,
            'observaciones' => $request->observaciones,
            'estado' => $request->estado
        ]);

        return response()->json([
            'message' => 'Producto guardado en inventario correctamente',
            'inventario' => $inventario
        ]);
    }

    public function guardarLote(Request $request)
    {
        $request->validate([
            'productos' => 'required|array|min:1',
            'productos.*.id_finca' => 'nullable|integer',
            'productos.*.tipo_producto' => 'required|max:50',
            'productos.*.id_plaguicida_registrado' => 'nullable|integer',
            'productos.*.id_fertilizante_registrado' => 'nullable|integer',
            'productos.*.nombre_manual' => 'nullable|max:150',
            'productos.*.descripcion_manual' => 'nullable|max:255',
            'productos.*.cantidad' => 'required|numeric',
            'productos.*.unidad_medida' => 'required|max:30',
            'productos.*.fecha_compra' => 'nullable|date',
            'productos.*.fecha_vencimiento' => 'nullable|date',
            'productos.*.ubicacion' => 'nullable|max:150',
            'productos.*.observaciones' => 'nullable|max:255',
            'productos.*.estado' => 'required|boolean'
        ]);

        $usuario = request()->user();

        $guardados = [];

        foreach ($request->productos as $producto) {

            if (!empty($producto['id_finca'])) {

                $finca = Finca::whereKey($producto['id_finca'])
                    ->first();

                if (!$finca) {
                    return response()->json([
                        'message' => 'Finca no encontrada'
                    ], 404);
                }

                if (
                    $usuario->rol === 'Agricultor'
                    &&
                    $finca->id_usuario !== $usuario->id_usuario
                ) {
                    return response()->json([
                        'message' => 'No autorizado'
                    ], 403);
                }
            }

            $guardados[] = Inventario::create([
                'id_usuario' => $usuario->id_usuario,
                'id_finca' => $producto['id_finca'] ?? null,

                'tipo_producto' => $producto['tipo_producto'],

                'id_plaguicida_registrado' => $producto['id_plaguicida_registrado'] ?? null,
                'id_fertilizante_registrado' => $producto['id_fertilizante_registrado'] ?? null,

                'nombre_manual' => $producto['nombre_manual'] ?? null,
                'descripcion_manual' => $producto['descripcion_manual'] ?? null,

                'cantidad' => $producto['cantidad'],
                'unidad_medida' => $producto['unidad_medida'],

                'fecha_compra' => $producto['fecha_compra'] ?? null,
                'fecha_vencimiento' => $producto['fecha_vencimiento'] ?? null,

                'ubicacion' => $producto['ubicacion'] ?? null,
                'observaciones' => $producto['observaciones'] ?? null,

                'estado' => $producto['estado']
            ]);
        }

        return response()->json([
            'message' => 'Productos guardados correctamente',
            'productos' => $guardados
        ]);
    }

    public function actualizar(Request $request, $id)
    {
        $request->validate([
            'id_finca' => 'nullable|integer',
            'tipo_producto' => 'required|max:50',
            'nombre_manual' => 'nullable|max:150',
            'descripcion_manual' => 'nullable|max:255',
            'cantidad' => 'required|numeric',
            'unidad_medida' => 'required|max:30',
            'fecha_compra' => 'nullable|date',
            'fecha_vencimiento' => 'nullable|date',
            'ubicacion' => 'nullable|max:150',
            'observaciones' => 'nullable|max:255',
            'estado' => 'required|boolean'
        ]);

        $usuario = request()->user();

        $inventario = Inventario::whereKey($id)->first();

        if (!$inventario) {
            return response()->json([
                'message' => 'Inventario no encontrado'
            ], 404);
        }

        if (
            $usuario->rol === 'Agricultor'
            &&
            $inventario->id_usuario !== $usuario->id_usuario
        ) {
            return response()->json([
                'message' => 'No autorizado'
            ], 403);
        }

        if ($request->id_finca) {
            $finca = Finca::whereKey($request->id_finca)->first();

            if (!$finca) {
                return response()->json([
                    'message' => 'Finca no encontrada'
                ], 404);
            }

            if (
                $usuario->rol === 'Agricultor'
                &&
                $finca->id_usuario !== $usuario->id_usuario
            ) {
                return response()->json([
                    'message' => 'No autorizado'
                ], 403);
            }
        }

        $inventario  -> update([
            'id_usuario' => $usuario->id_usuario,
            'id_finca' => $request->id_finca,
            'tipo_producto' => $request->tipo_producto,
            'id_plaguicida_registrado' => $request->id_plaguicida_registrado,
            'id_fertilizante_registrado' => $request->id_fertilizante_registrado,
            'nombre_manual' => $request->nombre_manual,
            'descripcion_manual' => $request->descripcion_manual,
            'cantidad' => $request->cantidad,
            'unidad_medida' => $request->unidad_medida,
            'fecha_compra' => $request->fecha_compra,
            'fecha_vencimiento' => $request->fecha_vencimiento,
            'ubicacion' => $request->ubicacion,
            'observaciones' => $request->observaciones,
            'estado' => $request->estado
        ]);

        return response()->json([
            'message' => 'Inventario actualizado correctamente',
            'inventario' => $inventario
        ]);
    }

    public function eliminar($id)
    {
        $usuario = request()->user();

        $inventario = Inventario::whereKey($id)->first();

        if (!$inventario) {
            return response()->json([
                'message' => 'Inventario no encontrado'
            ], 404);
        }

        if (
            $usuario->rol === 'Agricultor'
            &&
            $inventario->id_usuario !== $usuario->id_usuario
        ) {
            return response()->json([
                'message' => 'No autorizado'
            ], 403);
        }

        $inventario->delete();

        return response()->json([
            'message' => 'Producto eliminado del inventario correctamente'
        ]);
    }
}