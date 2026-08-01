<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produccion extends Model
{
    protected $table = 'tbl_produccion';

    protected $primaryKey = 'id_produccion';

    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'id_finca',
        'id_cultivo',
        'fecha',
        'cantidad',
        'unidad_medida',
        'cantidad_plantas',
        'calidad',
        'destino',
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
}