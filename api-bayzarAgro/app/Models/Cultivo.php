<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cultivo extends Model
{
    protected $table = 'tbl_cultivo';

    protected $primaryKey = 'id_cultivo';

    public $timestamps = false;

    protected $fillable = [
        'id_finca',
        'nombre',
        'tipo_cultivo',
        'variedad',
        'fecha_siembra',
        'fecha_estimada_cosecha',
        'area_sembrada',
        'cantidad_plantas',
        'distancia_siembra',
        'unidad_area',
        'estado_cultivo',
        'descripcion',
        'estado'
    ];

    // RELACION FINCA 
    public function finca()
    {
        return $this -> belongsTo(
            Finca::class,
            'id_finca',
            'id_finca'
        );
    }

    // RELACION ACTIVIDADES
    public function actividades()
    {
        return $this->hasMany(
            Actividad::class,
            'id_cultivo',
            'id_cultivo'
        );
    }

    // RELACION PLAGAS
    public function plagas()
    {
        return $this->hasMany(
            PlagaCultivo::class,
            'id_cultivo',
            'id_cultivo'
        );
    }
}
