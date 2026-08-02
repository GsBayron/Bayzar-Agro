<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UsuarioController extends Controller
{
    // LISTAR
    public function listar()
    {
        return response()->json(
            Usuario::orderBy('id_usuario', 'desc')->get()
        );
    }

    // CONSULTAR
    public function consultar($id)
    {
        $usuario = Usuario::find($id);

        if (! $usuario) {
            return response()->json([
                'message' => 'Usuario no encontrado',
            ], 404);
        }

        return response()->json($usuario);
    }

    // GUARDAR
    public function guardar(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:50',
            'apellidos' => 'required|string|max:80',
            'correo' => 'required|email|unique:tbl_usuario,correo',
            'telefono' => 'nullable|string|max:20',
            'acceso' => 'required|string|max:100|unique:tbl_usuario,acceso',
            'secreto' => 'required|string|min:8|max:255',
            'rol' => ['required', Rule::in(['Administrador', 'Agricultor'])],
            'estado' => 'required|boolean',
        ]);

        $usuario = Usuario::create([
            'nombre' => $request->nombre,
            'apellidos' => $request->apellidos,
            'correo' => $request->correo,
            'telefono' => $request->telefono,
            'acceso' => $request->acceso,
            'secreto' => Hash::make($request->secreto),
            'rol' => $request->rol,
            'estado' => $request->estado,
        ]);

        return response()->json([
            'message' => 'Usuario guardado correctamente',
            'data' => $usuario,
        ], 201);
    }

    // ACTUALIZAR
    public function actualizar(Request $request)
    {
        $request->validate([
            'id_usuario' => 'required|integer|exists:tbl_usuario,id_usuario',
            'nombre' => 'required|string|max:50',
            'apellidos' => 'required|string|max:80',
            'correo' => [
                'required',
                'email',
                Rule::unique('tbl_usuario', 'correo')
                    ->ignore($request->id_usuario, 'id_usuario'),
            ],
            'telefono' => 'nullable|string|max:20',
            'acceso' => [
                'required',
                'string',
                'max:100',
                Rule::unique('tbl_usuario', 'acceso')
                    ->ignore($request->id_usuario, 'id_usuario'),
            ],
            'secreto' => 'nullable|string|min:8|max:255',
            'rol' => ['required', Rule::in(['Administrador', 'Agricultor'])],
            'estado' => 'required|boolean',
        ]);

        $usuario = Usuario::find($request->id_usuario);

        if (! $usuario) {
            return response()->json([
                'message' => 'Usuario no encontrado',
            ], 404);
        }

        $usuario->nombre = $request->nombre;
        $usuario->apellidos = $request->apellidos;
        $usuario->correo = $request->correo;
        $usuario->telefono = $request->telefono;
        $usuario->acceso = $request->acceso;
        $usuario->rol = $request->rol;
        $usuario->estado = $request->estado;

        // Actualizar contraseña solo si viene
        if ($request->filled('secreto')) {
            $usuario->secreto = Hash::make($request->secreto);
        }

        $usuario->save();

        return response()->json([
            'message' => 'Usuario actualizado correctamente',
            'data' => $usuario->fresh(),
        ]);
    }

    // ELIMINAR
    public function eliminar($id)
    {
        $usuarioAutenticado = request()->user();

        $usuario = Usuario::find($id);

        if (! $usuario) {
            return response()->json([
                'message' => 'Usuario no encontrado',
            ], 404);
        }

        // Evitar que el administrador elimine su propia cuenta.
        if ($usuario->id_usuario === $usuarioAutenticado->id_usuario) {
            return response()->json([
                'message' => 'No puede eliminar su propio usuario',
            ], 422);
        }

        $usuario->delete();

        return response()->json([
            'message' => 'Usuario eliminado correctamente',
        ]);
    }
}
