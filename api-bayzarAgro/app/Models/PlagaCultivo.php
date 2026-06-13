<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlagaCultivo extends Model
{
    protected $table = 'tbl_plaga_cultivo';

    protected $primaryKey = 'id_plaga_cultivo';
    
    public $timestamps = false;

    protected $fillable = [
        'id_cultivo',
        'id_plaga_registrada',
        'nombre_manual',
        'tipo_plaga_manual',
        'fecha_deteccion',
        'nivel_riesgo',
        'estado_plaga',
        'descripcion',
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

    public function plaga()
    {
        return $this->belongsTo(
            PlagaRegistrada::class,
            'id_plaga_registrada',
            'id_plaga_registrada'
        );
    }
}