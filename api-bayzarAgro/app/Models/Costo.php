<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Costo extends Model
{
    protected $table = 'tbl_costo';

    protected $primaryKey = 'id_costo';

    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'id_finca',
        'id_cultivo',
        'id_actividad',
        'tipo_costo',
        'descripcion',
        'cantidad_personas',
        'horas_trabajadas',
        'costo_por_hora',
        'monto',
        'fecha',
        'observaciones',
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

    public function finca()
    {
        return $this->belongsTo(
            Finca::class,
            'id_finca',
            'id_finca'
        );
    }

    public function cultivo()
    {
        return $this->belongsTo(
            Cultivo::class,
            'id_cultivo',
            'id_cultivo'
        );
    }

    public function actividad()
    {
        return $this->belongsTo(
            Actividad::class,
            'id_actividad',
            'id_actividad'
        );
    }
}