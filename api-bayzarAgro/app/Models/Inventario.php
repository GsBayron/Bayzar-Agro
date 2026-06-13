<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventario extends Model
{
    protected $table = 'tbl_inventario';

    protected $primaryKey = 'id_inventario';

    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'id_finca',
        'tipo_producto',
        'id_plaguicida_registrado',
        'id_fertilizante_registrado',
        'nombre_manual',
        'descripcion_manual',
        'cantidad',
        'unidad_medida',
        'fecha_compra',
        'fecha_vencimiento',
        'ubicacion',
        'observaciones',
        'estado'
    ];

    public function usuario() {
        return $this -> belongsTo(
            Usuario::class,
            'id_usuario',
            'id_usuario'
        );
    }

    public function finca() {
        return $this -> belongsTo(
            Finca::class,
            'id_finca',
            'id_finca'
        );
    }

    public function plaguicida()
    {
        return $this->belongsTo(
            PlaguicidaRegistrado::class,
            'id_plaguicida_registrado',
            'id_plaguicida_registrado'
        );
    }

    public function fertilizante()
    {
        return $this->belongsTo(
            FertilizanteRegistrado::class,
            'id_fertilizante_registrado',
            'id_fertilizante_registrado'
        );
    }

    public function actividades()
    {
        return $this->hasMany(
            Actividad::class,
            'id_inventario',
            'id_inventario'
        );
    }
}
