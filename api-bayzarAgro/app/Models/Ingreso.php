<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ingreso extends Model
{
    protected $table = 'tbl_ingreso';

    protected $primaryKey = 'id_ingreso';

    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'id_finca',
        'id_cultivo',
        'id_produccion',
        'fecha',
        'descripcion',
        'cantidad_vendida',
        'unidad_medida',
        'precio_unitario',
        'monto_total',
        'cliente',
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

    public function produccion()
    {
        return $this->belongsTo(
            Produccion::class,
            'id_produccion',
            'id_produccion'
        );
    }
}