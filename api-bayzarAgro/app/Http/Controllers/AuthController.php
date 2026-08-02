<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credenciales = $request->validate([
            'acceso' => 'required|string|max:150',
            'secreto' => 'required|string|max:255',
        ]);

        $usuario = Usuario::query()
            ->where('acceso', '=', $credenciales['acceso'])
            ->orWhere('correo', '=', $credenciales['acceso'])
            ->first();

        if (! $usuario || ! Hash::check($credenciales['secreto'], $usuario->secreto)) {
            return response()->json([
                'message' => 'Usuario o contraseña incorrectos',
            ], 401);
        }

        if ((int) $usuario->estado !== 1) {
            return response()->json([
                'message' => 'Su cuenta está pendiente de activación por pago.',
                'estado_pago' => $usuario->estado_pago,
                'motivo' => 'cuenta_inactiva',
            ], 403);
        }

        $token = $usuario->createToken('BayzarAgro')->accessToken;

        return response()->json([
            'message' => 'Inicio de sesión correcto',
            'token' => $token,
            'usuario' => [
                'id_usuario' => $usuario->id_usuario,
                'id_plan' => $usuario->id_plan,
                'nombre' => $usuario->nombre,
                'apellidos' => $usuario->apellidos,
                'correo' => $usuario->correo,
                'telefono' => $usuario->telefono,
                'acceso' => $usuario->acceso,
                'rol' => $usuario->rol,
                'estado' => $usuario->estado,
                'estado_pago' => $usuario->estado_pago,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()?->token()?->revoke();

        return response()->json([
            'message' => 'Sesión cerrada correctamente',
        ]);
    }

    public function perfil(Request $request)
    {
        return response()->json($request->user());
    }

    public function actualizarPerfil(Request $request)
    {
        $usuario = $request->user();

        if (! $usuario) {
            return response()->json([
                'message' => 'No autenticado',
            ], 401);
        }

        $datos = $request->validate([
            'nombre' => 'required|string|max:100',
            'apellidos' => 'nullable|string|max:150',
            'correo' => [
                'required',
                'email',
                'max:150',
                Rule::unique('tbl_usuario', 'correo')
                    ->ignore($usuario->id_usuario, 'id_usuario'),
            ],
            'telefono' => 'nullable|string|max:30',
            'acceso' => [
                'required',
                'string',
                'max:100',
                Rule::unique('tbl_usuario', 'acceso')
                    ->ignore($usuario->id_usuario, 'id_usuario'),
            ],
            'secreto' => 'nullable|string|min:8|max:255',
        ]);

        if (! empty($datos['secreto'])) {
            $datos['secreto'] = Hash::make($datos['secreto']);
        } else {
            unset($datos['secreto']);
        }

        $usuario->update($datos);

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'usuario' => $usuario->fresh(),
        ]);
    }
}
