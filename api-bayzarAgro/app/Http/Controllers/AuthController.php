<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /*public function login(Request $request)
    {
        $request->validate([
            'acceso' => 'required|string',
            'secreto' => 'required|string'
        ]);

        $usuario = Usuario::where('acceso', $request->acceso)
            ->where('estado', 1)
            ->first();

        if (!$usuario || !Hash::check($request->secreto, $usuario->secreto)) {
            return response()->json([
                'mensaje' => 'Credenciales incorrectas'
            ], 401);
        }

        $token = $usuario->createToken('API Token')->accessToken;

        return response()->json([
            'mensaje' => 'Login correcto',
            'token' => $token,
            'usuario' => $usuario
        ]);
    }*/
    
        public function login(Request $request)
{
    $request->validate([
        'acceso' => 'required|string',
        'secreto' => 'required|string'
    ]);

    $usuario = Usuario::query()
        ->where('acceso', '=', $request->acceso)
        ->orWhere('correo', '=', $request->acceso)
        ->first();

    if (!$usuario || !Hash::check($request->secreto, $usuario->secreto)) {
        return response()->json([
            'message' => 'Usuario o contraseña incorrectos'
        ], 401);
    }

    if ((int) $usuario->estado !== 1) {
        return response()->json([
            'message' => 'Su cuenta está pendiente de activación por pago.',
            'estado_pago' => $usuario->estado_pago,
            'motivo' => 'cuenta_inactiva'
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
            'estado_pago' => $usuario->estado_pago
        ]
    ]);
}

    public function logout(Request $request)
    {
        $request->user()->token()->revoke();

        return response()->json([
            'mensaje' => 'Sesión cerrada correctamente'
        ]);
    }

    public function perfil(Request $request)
    {
        return response()->json($request->user());
    }

    public function actualizarPerfil(Request $request)
    {
        $usuario = $request->user();

        if (!$usuario) {
            return response()->json([
                'message' => 'No autenticado'
            ], 401);
        }

        $request->validate([
            'nombre' => 'required|string|max:100',
            'apellidos' => 'nullable|string|max:150',
            'correo' => [
                'required',
                'email',
                'max:150',
                Rule::unique('tbl_usuario', 'correo')
                    ->ignore($usuario->id_usuario, 'id_usuario')
            ],
            'telefono' => 'nullable|string|max:30',
            'acceso' => [
                'required',
                'string',
                'max:100',
                Rule::unique('tbl_usuario', 'acceso')
                    ->ignore($usuario->id_usuario, 'id_usuario')
            ],
            'secreto' => 'nullable|string|min:6'
        ]);

        $usuario->nombre = $request->nombre;
        $usuario->apellidos = $request->apellidos;
        $usuario->correo = $request->correo;
        $usuario->telefono = $request->telefono;
        $usuario->acceso = $request->acceso;

        if ($request->filled('secreto')) {
            $usuario->secreto = Hash::make($request->secreto);
        }

        $usuario->save();

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'usuario' => $usuario
        ]);
    }
}
