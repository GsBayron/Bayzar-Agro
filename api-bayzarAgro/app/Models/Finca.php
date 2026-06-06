<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Finca extends Model
{
    protected $table = 'tbl_finca';

    protected $primaryKey = 'id_finca';

    public $timestamps = false;

    protected $fillable = [
         'id_usuario',
         'nombre',
         'ubicacion',
         'provincia',
         'canton',
         'distrito',
         'area',
         'unidad_area',
         'descripcion',
         'estado'
    ];

    public function usuario()
    {
        return $this->belongsTo(
            Usuario::class,
            'id_usuario',
            'id_usuario'
        );
    }

}
