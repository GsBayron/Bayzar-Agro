<?php

namespace App\Http\Controllers\Api\Publico;

use App\Http\Controllers\Controller;

use App\Models\Plan;

class PlanPublicoController extends Controller
{
    public function listar()
    {
        $planes = Plan::query()
            ->where('estado', '=', 1)
            ->orderBy('precio_mensual', 'asc')
            ->get();

        return response()->json($planes);
    }
}