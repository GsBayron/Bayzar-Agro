<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
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
}