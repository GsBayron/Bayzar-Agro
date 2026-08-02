<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Finca;
use App\Models\Inventario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

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

        if (! $inventario) {
            return response()->json([
                'message' => 'Inventario no encontrado',
            ], 404);
        }

        if (
            $usuario->rol !== 'Administrador'
            &&
            $inventario->id_usuario !== $usuario->id_usuario
        ) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        return response()->json($inventario);
    }

    public function guardar(Request $request)
    {
        $datos = $request->validate([
            'id_finca' => 'nullable|integer|exists:tbl_finca,id_finca',
            'tipo_producto' => [
                'required',
                'string',
                'max:50',
                Rule::in([
                    'Plaguicida registrado',
                    'Fertilizante registrado',
                    'Producto manual',
                ]),
            ],
            'id_plaguicida_registrado' => 'nullable|integer|exists:tbl_plaguicida_registrado,id_plaguicida_registrado',
            'id_fertilizante_registrado' => 'nullable|integer|exists:tbl_fertilizante_registrado,id_fertilizante_registrado',
            'nombre_manual' => 'nullable|string|max:150',
            'descripcion_manual' => 'nullable|string|max:255',
            'cantidad' => 'required|numeric|gt:0',
            'unidad_medida' => 'required|string|max:30',
            'fecha_compra' => 'nullable|date',
            'fecha_vencimiento' => 'nullable|date|after_or_equal:fecha_compra',
            'ubicacion' => 'nullable|string|max:150',
            'observaciones' => 'nullable|string|max:255',
            'estado' => 'required|boolean',
        ]);

        $usuario = request()->user();

        $this->validarProducto($datos);

        if (! empty($datos['id_finca'])) {
            $finca = Finca::whereKey($datos['id_finca'])->first();

            if (! $finca) {
                return response()->json([
                    'message' => 'Finca no encontrada',
                ], 404);
            }

            if (
                $usuario->rol !== 'Administrador'
                &&
                $finca->id_usuario !== $usuario->id_usuario
            ) {
                return response()->json([
                    'message' => 'No autorizado',
                ], 403);
            }
        }

        $inventario = Inventario::create([
            'id_usuario' => $usuario->id_usuario,
            ...$datos,
        ]);

        return response()->json([
            'message' => 'Producto guardado en inventario correctamente',
            'inventario' => $inventario,
        ]);
    }

    public function guardarLote(Request $request)
    {
        $datos = $request->validate([
            'productos' => 'required|array|min:1|max:100',
            'productos.*.id_finca' => 'nullable|integer|exists:tbl_finca,id_finca',
            'productos.*.tipo_producto' => [
                'required',
                'string',
                'max:50',
                Rule::in([
                    'Plaguicida registrado',
                    'Fertilizante registrado',
                    'Producto manual',
                ]),
            ],
            'productos.*.id_plaguicida_registrado' => 'nullable|integer|exists:tbl_plaguicida_registrado,id_plaguicida_registrado',
            'productos.*.id_fertilizante_registrado' => 'nullable|integer|exists:tbl_fertilizante_registrado,id_fertilizante_registrado',
            'productos.*.nombre_manual' => 'nullable|string|max:150',
            'productos.*.descripcion_manual' => 'nullable|string|max:255',
            'productos.*.cantidad' => 'required|numeric|gt:0',
            'productos.*.unidad_medida' => 'required|string|max:30',
            'productos.*.fecha_compra' => 'nullable|date',
            'productos.*.fecha_vencimiento' => 'nullable|date|after_or_equal:productos.*.fecha_compra',
            'productos.*.ubicacion' => 'nullable|string|max:150',
            'productos.*.observaciones' => 'nullable|string|max:255',
            'productos.*.estado' => 'required|boolean',
        ]);

        $usuario = request()->user();

        $productos = $datos['productos'];

        foreach ($productos as $indice => $producto) {
            $this->validarProducto($producto, "productos.$indice");
        }

        $fincaIds = collect($productos)
            ->pluck('id_finca')
            ->filter()
            ->unique()
            ->values();
        $fincas = Finca::query()
            ->whereIn('id_finca', $fincaIds)
            ->get()
            ->keyBy('id_finca');

        foreach ($fincaIds as $fincaId) {
            $finca = $fincas->get($fincaId);

            if (! $finca) {
                return response()->json([
                    'message' => 'Finca no encontrada',
                ], 404);
            }

            if (
                $usuario->rol !== 'Administrador'
                && $finca->id_usuario !== $usuario->id_usuario
            ) {
                return response()->json([
                    'message' => 'No autorizado',
                ], 403);
            }
        }

        $guardados = DB::transaction(function () use ($productos, $usuario) {
            return collect($productos)->map(function (array $producto) use ($usuario) {
                return Inventario::create([
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

                    'estado' => $producto['estado'],
                ]);
            })->values();
        });

        return response()->json([
            'message' => 'Productos guardados correctamente',
            'productos' => $guardados,
        ]);
    }

    public function actualizar(Request $request, $id)
    {
        $datos = $request->validate([
            'id_finca' => 'nullable|integer|exists:tbl_finca,id_finca',
            'tipo_producto' => [
                'required',
                'string',
                'max:50',
                Rule::in([
                    'Plaguicida registrado',
                    'Fertilizante registrado',
                    'Producto manual',
                ]),
            ],
            'id_plaguicida_registrado' => 'nullable|integer|exists:tbl_plaguicida_registrado,id_plaguicida_registrado',
            'id_fertilizante_registrado' => 'nullable|integer|exists:tbl_fertilizante_registrado,id_fertilizante_registrado',
            'nombre_manual' => 'nullable|string|max:150',
            'descripcion_manual' => 'nullable|string|max:255',
            'cantidad' => 'required|numeric|min:0',
            'unidad_medida' => 'required|string|max:30',
            'fecha_compra' => 'nullable|date',
            'fecha_vencimiento' => 'nullable|date|after_or_equal:fecha_compra',
            'ubicacion' => 'nullable|string|max:150',
            'observaciones' => 'nullable|string|max:255',
            'estado' => 'required|boolean',
        ]);

        $usuario = request()->user();

        $this->validarProducto($datos);

        $inventario = Inventario::whereKey($id)->first();

        if (! $inventario) {
            return response()->json([
                'message' => 'Inventario no encontrado',
            ], 404);
        }

        if (
            $usuario->rol !== 'Administrador'
            &&
            $inventario->id_usuario !== $usuario->id_usuario
        ) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        if (! empty($datos['id_finca'])) {
            $finca = Finca::whereKey($datos['id_finca'])->first();

            if (! $finca) {
                return response()->json([
                    'message' => 'Finca no encontrada',
                ], 404);
            }

            if (
                $usuario->rol !== 'Administrador'
                &&
                $finca->id_usuario !== $usuario->id_usuario
            ) {
                return response()->json([
                    'message' => 'No autorizado',
                ], 403);
            }
        }

        $inventario->update($datos);

        return response()->json([
            'message' => 'Inventario actualizado correctamente',
            'inventario' => $inventario,
        ]);
    }

    public function eliminar($id)
    {
        $usuario = request()->user();

        $inventario = Inventario::whereKey($id)->first();

        if (! $inventario) {
            return response()->json([
                'message' => 'Inventario no encontrado',
            ], 404);
        }

        if (
            $usuario->rol !== 'Administrador'
            &&
            $inventario->id_usuario !== $usuario->id_usuario
        ) {
            return response()->json([
                'message' => 'No autorizado',
            ], 403);
        }

        $inventario->delete();

        return response()->json([
            'message' => 'Producto eliminado del inventario correctamente',
        ]);
    }

    private function validarProducto(array $producto, string $prefijo = ''): void
    {
        $campo = static fn (string $nombre) => $prefijo === ''
            ? $nombre
            : $prefijo.'.'.$nombre;

        $errores = [];

        if (
            $producto['tipo_producto'] === 'Plaguicida registrado'
            && empty($producto['id_plaguicida_registrado'])
        ) {
            $errores[$campo('id_plaguicida_registrado')] = [
                'Debe seleccionar un plaguicida registrado.',
            ];
        }

        if (
            $producto['tipo_producto'] === 'Fertilizante registrado'
            && empty($producto['id_fertilizante_registrado'])
        ) {
            $errores[$campo('id_fertilizante_registrado')] = [
                'Debe seleccionar un fertilizante registrado.',
            ];
        }

        if (
            $producto['tipo_producto'] === 'Producto manual'
            && blank($producto['nombre_manual'] ?? null)
        ) {
            $errores[$campo('nombre_manual')] = [
                'El nombre es obligatorio para un producto manual.',
            ];
        }

        if ($errores !== []) {
            throw ValidationException::withMessages($errores);
        }
    }
}
