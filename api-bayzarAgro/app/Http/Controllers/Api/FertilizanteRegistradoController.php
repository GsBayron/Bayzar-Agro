<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FertilizanteRegistrado;

class FertilizanteRegistradoController extends Controller
{
    public function listar()
    {
        return response()->json(
            FertilizanteRegistrado::query()
                ->where('estado', 1)
                ->orderBy('nombre_comercial', 'asc')
                ->get()
        );
    }
}