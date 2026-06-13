<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Actividad extends Model
{
    protected $table = 'tbl_actividad';

    protected $primaryKey = 'id_actividad';

    public $timestamps = false;

    protected $fillable = [
        'id_cultivo',
        'id_inventario',
        'tipo_actividad',
        'fecha_programada',
        'fecha_realizacion',
        'estado_actividad',
        'prioridad',
        'descripcion',
        'cantidad_producto',
        'unidad_producto',
        'responsable',
        'observaciones',
        'estado'
    ];
    

    public function cultivo()
    {
        return $this->belongsTo(
            Cultivo::class,
            'id_cultivo',
            'id_cultivo'
        );
    }

     public function inventario()
    {
        return $this->belongsTo(
            Inventario::class,
            'id_inventario',
            'id_inventario'
        );
    }
}