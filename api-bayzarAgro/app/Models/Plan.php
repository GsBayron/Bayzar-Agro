<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $table = 'tbl_plan';

    protected $primaryKey = 'id_plan';

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'codigo',
        'precio_mensual',
        'descripcion',
        'limite_usuarios',
        'limite_fincas',
        'almacenamiento_mb',
        'soporte',
        'destacado',
        'estado'
    ];

    public function usuarios()
    {
        return $this->hasMany(
            Usuario::class,
            'id_plan',
            'id_plan'
        );
    }
}