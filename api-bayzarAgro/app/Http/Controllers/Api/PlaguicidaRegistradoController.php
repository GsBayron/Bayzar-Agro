<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlaguicidaRegistrado;

class PlaguicidaRegistradoController extends Controller
{
    public function listar()
    {
        return response()->json(
            PlaguicidaRegistrado::query()
                ->where('estado', 1)
                ->orderBy('nombre_comercial', 'asc')
                ->get()
        );
    }
}