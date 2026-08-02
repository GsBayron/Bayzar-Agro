<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Passport\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'tbl_usuario';
    protected $primaryKey = 'id_usuario';

    public $timestamps = false;

    protected $fillable = [
        'id_plan',
        'nombre',
        'apellidos',
        'correo',
        'telefono',
        'acceso',
        'secreto',
        'rol',
        'estado',
        'estado_pago'

    ];

    protected $hidden = [
        'secreto'
    ];

    public function getAuthPassword()
    {
        return $this->secreto;
    }

    public function fincas()
    {
        return $this->hasMany(
            Finca::class,
            'id_usuario',
            'id_usuario'
        );
    }

    public function inventario()
    {
        return $this->hasMany(
            Inventario::class,
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

    public function suscripciones()
    {
        return $this->hasMany(
            Suscripcion::class,
            'id_usuario',
            'id_usuario'
        );
    }
}
