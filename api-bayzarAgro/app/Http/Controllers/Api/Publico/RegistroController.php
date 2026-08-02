<?php

namespace App\Http\Controllers\Api\Publico;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Suscripcion;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class RegistroController extends Controller
{
    public function registrar(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'apellidos' => 'nullable|string|max:150',
            'correo' => 'required|email|max:150|unique:tbl_usuario,correo',
            'telefono' => 'nullable|string|max:30',
            'secreto' => 'required|string|min:8|max:255',
            'confirmar_secreto' => 'required|same:secreto',
            'plan' => 'required|string|exists:tbl_plan,codigo',
        ]);

        $plan = Plan::query()
            ->where('codigo', '=', $request->plan)
            ->where('estado', '=', 1)
            ->first();

        if (! $plan) {
            return response()->json([
                'message' => 'El plan seleccionado no está disponible',
            ], 422);
        }

        $esPlanGratuito = $plan->codigo === 'gratuito';

        try {
            $usuario = DB::transaction(function () use (
                $request,
                $plan,
                $esPlanGratuito
            ) {

                $usuario = Usuario::create([
                    'id_plan' => $plan->id_plan,
                    'nombre' => $request->nombre,
                    'apellidos' => $request->apellidos,
                    'correo' => $request->correo,
                    'telefono' => $request->telefono,
                    'acceso' => $request->correo,
                    'secreto' => Hash::make($request->secreto),
                    'rol' => 'Agricultor',
                    'estado' => $esPlanGratuito ? 1 : 0,
                    'estado_pago' => $esPlanGratuito ? 'Activo' : 'Pendiente de pago',
                ]);

                Suscripcion::create([
                    'id_usuario' => $usuario->id_usuario,
                    'id_plan' => $plan->id_plan,
                    'estado_suscripcion' => $esPlanGratuito ? 'Activa' : 'Pendiente de pago',
                    'fecha_inicio' => Carbon::today()->toDateString(),
                    'fecha_fin' => null,
                    'metodo_pago' => null,
                    'referencia_pago' => null,
                    'monto' => $plan->precio_mensual,
                ]);

                return $usuario;
            });
        } catch (QueryException $exception) {
            $sqlState = $exception->errorInfo[0] ?? (string) $exception->getCode();

            if (in_array($sqlState, ['23000', '23505'], true)) {
                throw ValidationException::withMessages([
                    'correo' => 'El correo ya se encuentra registrado.',
                ]);
            }

            throw $exception;
        }

        return response()->json([
            'message' => $esPlanGratuito
                ? 'Cuenta creada correctamente'
                : 'Cuenta creada. Complete el proceso de pago para activar el acceso.',
            'requiere_pago' => ! $esPlanGratuito,
            'redirect' => $esPlanGratuito
                ? '/bienvenida?tipo=gratuito'
                : '/bienvenida?tipo=pago-pendiente',
            'usuario' => [
                'id_usuario' => $usuario->id_usuario,
                'nombre' => $usuario->nombre,
                'apellidos' => $usuario->apellidos,
                'correo' => $usuario->correo,
                'rol' => $usuario->rol,
                'estado_pago' => $usuario->estado_pago,
            ],
        ], 201);
    }
}
