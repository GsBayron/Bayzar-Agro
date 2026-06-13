<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FertilizanteRegistrado extends Model
{
    protected $table = 'tbl_fertilizante_registrado';

    protected $primaryKey = 'id_fertilizante_registrado';

    public $timestamps = false;

    protected $fillable = [
        'numero_registro',
        'nombre_comercial',
        'composicion',
        'tipo_fertilizante',
        'fabricante',
        'estado_registro',
        'fuente',
        'estado'
    ];
}