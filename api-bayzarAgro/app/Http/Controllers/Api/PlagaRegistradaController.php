<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlagaRegistrada;

class PlagaRegistradaController extends Controller
{
    public function listar()
    {
        return response()->json(
            PlagaRegistrada::query()
             -> where('estado','=', 1)
             ->orderBy('nombre_comun', 'asc')
             ->get()
        );
    }
}
