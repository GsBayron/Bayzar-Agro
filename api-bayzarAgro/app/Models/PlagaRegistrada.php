<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlagaRegistrada extends Model
{
    protected $table = 'tbl_plaga_registrada';

    protected $primaryKey = 'id_plaga_registrada';

    public $timestamps = false; 

    protected $fillable = [
        'nombre_comun',
        'nombre_cientifico',
        'tipo_plaga',
        'descripcion',
        'fuente',
        'estado'
    ];
}
