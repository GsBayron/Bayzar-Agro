<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlaguicidaRegistrado extends Model
{
    protected $table = 'tbl_plaguicida_registrado';

    protected $primaryKey = 'id_plaguicida_registrado';

    public $timestamps = false;

    protected $fillable = [
        'numero_registro',
        'nombre_comercial',
        'ingrediente_activo',
        'tipo_plaguicida',
        'cultivo_autorizado',
        'plaga_objetivo',
        'titular',
        'estado_registro',
        'fuente',
        'estado'
    ];
}