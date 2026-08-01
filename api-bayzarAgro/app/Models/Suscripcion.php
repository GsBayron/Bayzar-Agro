<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Suscripcion extends Model
{
    protected $table = 'tbl_suscripcion';

    protected $primaryKey = 'id_suscripcion';

    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'id_plan',
        'estado_suscripcion',
        'fecha_inicio',
        'fecha_fin',
        'metodo_pago',
        'referencia_pago',
        'monto'
    ];

    public function usuario()
    {
        return $this->belongsTo(
            Usuario::class,
            'id_usuario',
            'id_usuario'
        );
    }

    public function plan()
    {
        return $this->belongsTo(
            Plan::class,
            'id_plan',
            'id_plan'
        );
    }
}