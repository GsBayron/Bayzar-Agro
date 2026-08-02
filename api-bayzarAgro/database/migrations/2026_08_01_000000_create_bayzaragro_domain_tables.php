<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('tbl_plan')) {
            Schema::create('tbl_plan', function (Blueprint $table) {
                $table->id('id_plan');
                $table->string('nombre', 100);
                $table->string('codigo', 50)->unique();
                $table->decimal('precio_mensual', 12, 2)->default(0);
                $table->string('descripcion', 500)->nullable();
                $table->unsignedInteger('limite_usuarios')->nullable();
                $table->unsignedInteger('limite_fincas')->nullable();
                $table->unsignedInteger('almacenamiento_mb')->nullable();
                $table->string('soporte', 50)->nullable();
                $table->boolean('destacado')->default(false);
                $table->boolean('estado')->default(true)->index();
            });
        }

        if (! Schema::hasTable('tbl_usuario')) {
            Schema::create('tbl_usuario', function (Blueprint $table) {
                $table->id('id_usuario');
                $table->unsignedBigInteger('id_plan')->nullable()->index();
                $table->string('nombre', 100);
                $table->string('apellidos', 150)->nullable();
                $table->string('correo', 150)->unique();
                $table->string('telefono', 30)->nullable();
                $table->string('acceso', 100)->unique();
                $table->string('secreto');
                $table->string('rol', 30)->index();
                $table->boolean('estado')->default(true)->index();
                $table->string('estado_pago', 50)->nullable();

                $table->foreign('id_plan')
                    ->references('id_plan')
                    ->on('tbl_plan')
                    ->nullOnDelete();
            });
        }

        if (! Schema::hasTable('tbl_plaguicida_registrado')) {
            Schema::create('tbl_plaguicida_registrado', function (Blueprint $table) {
                $table->id('id_plaguicida_registrado');
                $table->string('numero_registro', 100)->nullable()->index();
                $table->string('nombre_comercial', 200)->index();
                $table->string('ingrediente_activo')->nullable();
                $table->string('tipo_plaguicida', 100)->nullable();
                $table->string('cultivo_autorizado')->nullable();
                $table->string('plaga_objetivo')->nullable();
                $table->string('titular')->nullable();
                $table->string('estado_registro', 100)->nullable();
                $table->string('fuente')->nullable();
                $table->boolean('estado')->default(true)->index();
            });
        }

        if (! Schema::hasTable('tbl_fertilizante_registrado')) {
            Schema::create('tbl_fertilizante_registrado', function (Blueprint $table) {
                $table->id('id_fertilizante_registrado');
                $table->string('numero_registro', 100)->nullable()->index();
                $table->string('nombre_comercial', 200)->index();
                $table->string('composicion')->nullable();
                $table->string('tipo_fertilizante', 100)->nullable();
                $table->string('fabricante')->nullable();
                $table->string('estado_registro', 100)->nullable();
                $table->string('fuente')->nullable();
                $table->boolean('estado')->default(true)->index();
            });
        }

        if (! Schema::hasTable('tbl_plaga_registrada')) {
            Schema::create('tbl_plaga_registrada', function (Blueprint $table) {
                $table->id('id_plaga_registrada');
                $table->string('nombre_comun', 150)->index();
                $table->string('nombre_cientifico', 180)->nullable();
                $table->string('tipo_plaga', 80)->nullable();
                $table->string('descripcion', 500)->nullable();
                $table->string('fuente')->nullable();
                $table->boolean('estado')->default(true)->index();
            });
        }

        if (! Schema::hasTable('tbl_finca')) {
            Schema::create('tbl_finca', function (Blueprint $table) {
                $table->id('id_finca');
                $table->unsignedBigInteger('id_usuario')->index();
                $table->string('nombre', 100);
                $table->string('ubicacion', 200)->nullable();
                $table->string('provincia', 80)->nullable();
                $table->string('canton', 80)->nullable();
                $table->string('distrito', 80)->nullable();
                $table->decimal('latitud', 10, 7)->nullable();
                $table->decimal('longitud', 10, 7)->nullable();
                $table->decimal('area', 14, 4)->nullable();
                $table->string('unidad_area', 20)->nullable();
                $table->string('descripcion', 500)->nullable();
                $table->boolean('estado')->default(true)->index();

                $table->foreign('id_usuario')
                    ->references('id_usuario')
                    ->on('tbl_usuario')
                    ->restrictOnDelete();
            });
        }

        if (! Schema::hasTable('tbl_cultivo')) {
            Schema::create('tbl_cultivo', function (Blueprint $table) {
                $table->id('id_cultivo');
                $table->unsignedBigInteger('id_finca')->index();
                $table->string('nombre', 100);
                $table->string('tipo_cultivo', 100)->nullable();
                $table->string('variedad', 100)->nullable();
                $table->date('fecha_siembra')->nullable();
                $table->date('fecha_estimada_cosecha')->nullable();
                $table->decimal('area_sembrada', 14, 4)->nullable();
                $table->unsignedInteger('cantidad_plantas')->nullable();
                $table->string('distancia_siembra', 80)->nullable();
                $table->string('unidad_area', 30)->nullable();
                $table->string('estado_cultivo', 50);
                $table->string('descripcion', 500)->nullable();
                $table->boolean('estado')->default(true)->index();

                $table->foreign('id_finca')
                    ->references('id_finca')
                    ->on('tbl_finca')
                    ->restrictOnDelete();
            });
        }

        if (! Schema::hasTable('tbl_inventario')) {
            Schema::create('tbl_inventario', function (Blueprint $table) {
                $table->id('id_inventario');
                $table->unsignedBigInteger('id_usuario')->index();
                $table->unsignedBigInteger('id_finca')->nullable()->index();
                $table->string('tipo_producto', 50)->index();
                $table->unsignedBigInteger('id_plaguicida_registrado')->nullable()->index();
                $table->unsignedBigInteger('id_fertilizante_registrado')->nullable()->index();
                $table->string('nombre_manual', 150)->nullable();
                $table->string('descripcion_manual')->nullable();
                $table->decimal('cantidad', 14, 4)->default(0);
                $table->string('unidad_medida', 30);
                $table->date('fecha_compra')->nullable();
                $table->date('fecha_vencimiento')->nullable()->index();
                $table->string('ubicacion', 150)->nullable();
                $table->string('observaciones', 500)->nullable();
                $table->boolean('estado')->default(true)->index();

                $table->foreign('id_usuario')->references('id_usuario')->on('tbl_usuario')->restrictOnDelete();
                $table->foreign('id_finca')->references('id_finca')->on('tbl_finca')->restrictOnDelete();
                $table->foreign('id_plaguicida_registrado')->references('id_plaguicida_registrado')->on('tbl_plaguicida_registrado')->restrictOnDelete();
                $table->foreign('id_fertilizante_registrado')->references('id_fertilizante_registrado')->on('tbl_fertilizante_registrado')->restrictOnDelete();
            });
        }

        if (! Schema::hasTable('tbl_actividad')) {
            Schema::create('tbl_actividad', function (Blueprint $table) {
                $table->id('id_actividad');
                $table->unsignedBigInteger('id_cultivo')->index();
                $table->unsignedBigInteger('id_inventario')->nullable()->index();
                $table->string('tipo_actividad', 50);
                $table->date('fecha_programada')->index();
                $table->date('fecha_realizacion')->nullable();
                $table->string('estado_actividad', 30)->index();
                $table->string('prioridad', 20)->index();
                $table->string('descripcion', 500)->nullable();
                $table->decimal('cantidad_producto', 14, 4)->nullable();
                $table->string('unidad_producto', 30)->nullable();
                $table->string('responsable', 100)->nullable();
                $table->string('observaciones', 500)->nullable();
                $table->boolean('estado')->default(true)->index();

                $table->foreign('id_cultivo')->references('id_cultivo')->on('tbl_cultivo')->restrictOnDelete();
                $table->foreign('id_inventario')->references('id_inventario')->on('tbl_inventario')->restrictOnDelete();
            });
        }

        if (! Schema::hasTable('tbl_plaga_cultivo')) {
            Schema::create('tbl_plaga_cultivo', function (Blueprint $table) {
                $table->id('id_plaga_cultivo');
                $table->unsignedBigInteger('id_cultivo')->index();
                $table->unsignedBigInteger('id_plaga_registrada')->nullable()->index();
                $table->string('nombre_manual', 100)->nullable();
                $table->string('tipo_plaga_manual', 50)->nullable();
                $table->date('fecha_deteccion')->index();
                $table->string('nivel_riesgo', 30)->index();
                $table->string('estado_plaga', 30)->index();
                $table->string('descripcion', 500)->nullable();
                $table->string('observaciones', 500)->nullable();
                $table->boolean('estado')->default(true)->index();

                $table->foreign('id_cultivo')->references('id_cultivo')->on('tbl_cultivo')->restrictOnDelete();
                $table->foreign('id_plaga_registrada')->references('id_plaga_registrada')->on('tbl_plaga_registrada')->restrictOnDelete();
            });
        }

        if (! Schema::hasTable('tbl_produccion')) {
            Schema::create('tbl_produccion', function (Blueprint $table) {
                $table->id('id_produccion');
                $table->unsignedBigInteger('id_usuario')->index();
                $table->unsignedBigInteger('id_finca')->index();
                $table->unsignedBigInteger('id_cultivo')->index();
                $table->date('fecha')->index();
                $table->decimal('cantidad', 14, 4);
                $table->string('unidad_medida', 50);
                $table->unsignedInteger('cantidad_plantas')->nullable();
                $table->string('calidad', 80)->nullable();
                $table->string('destino', 100)->nullable();
                $table->string('observaciones', 500)->nullable();
                $table->boolean('estado')->default(true)->index();

                $table->foreign('id_usuario')->references('id_usuario')->on('tbl_usuario')->restrictOnDelete();
                $table->foreign('id_finca')->references('id_finca')->on('tbl_finca')->restrictOnDelete();
                $table->foreign('id_cultivo')->references('id_cultivo')->on('tbl_cultivo')->restrictOnDelete();
            });
        }

        if (! Schema::hasTable('tbl_costo')) {
            Schema::create('tbl_costo', function (Blueprint $table) {
                $table->id('id_costo');
                $table->unsignedBigInteger('id_usuario')->index();
                $table->unsignedBigInteger('id_finca')->nullable()->index();
                $table->unsignedBigInteger('id_cultivo')->nullable()->index();
                $table->unsignedBigInteger('id_actividad')->nullable()->index();
                $table->string('tipo_costo', 80)->index();
                $table->string('descripcion');
                $table->unsignedInteger('cantidad_personas')->nullable();
                $table->decimal('horas_trabajadas', 10, 2)->nullable();
                $table->decimal('costo_por_hora', 14, 2)->nullable();
                $table->decimal('monto', 14, 2);
                $table->date('fecha')->index();
                $table->string('observaciones', 500)->nullable();
                $table->boolean('estado')->default(true)->index();

                $table->foreign('id_usuario')->references('id_usuario')->on('tbl_usuario')->restrictOnDelete();
                $table->foreign('id_finca')->references('id_finca')->on('tbl_finca')->restrictOnDelete();
                $table->foreign('id_cultivo')->references('id_cultivo')->on('tbl_cultivo')->restrictOnDelete();
                $table->foreign('id_actividad')->references('id_actividad')->on('tbl_actividad')->restrictOnDelete();
            });
        }

        if (! Schema::hasTable('tbl_ingreso')) {
            Schema::create('tbl_ingreso', function (Blueprint $table) {
                $table->id('id_ingreso');
                $table->unsignedBigInteger('id_usuario')->index();
                $table->unsignedBigInteger('id_finca')->index();
                $table->unsignedBigInteger('id_cultivo')->index();
                $table->unsignedBigInteger('id_produccion')->nullable()->index();
                $table->date('fecha')->index();
                $table->string('descripcion');
                $table->decimal('cantidad_vendida', 14, 4);
                $table->string('unidad_medida', 50);
                $table->decimal('precio_unitario', 14, 2);
                $table->decimal('monto_total', 14, 2);
                $table->string('cliente', 150)->nullable();
                $table->string('destino', 100)->nullable();
                $table->string('observaciones', 500)->nullable();
                $table->boolean('estado')->default(true)->index();

                $table->foreign('id_usuario')->references('id_usuario')->on('tbl_usuario')->restrictOnDelete();
                $table->foreign('id_finca')->references('id_finca')->on('tbl_finca')->restrictOnDelete();
                $table->foreign('id_cultivo')->references('id_cultivo')->on('tbl_cultivo')->restrictOnDelete();
                $table->foreign('id_produccion')->references('id_produccion')->on('tbl_produccion')->restrictOnDelete();
            });
        }

        if (! Schema::hasTable('tbl_suscripcion')) {
            Schema::create('tbl_suscripcion', function (Blueprint $table) {
                $table->id('id_suscripcion');
                $table->unsignedBigInteger('id_usuario')->index();
                $table->unsignedBigInteger('id_plan')->index();
                $table->string('estado_suscripcion', 50)->index();
                $table->date('fecha_inicio');
                $table->date('fecha_fin')->nullable();
                $table->string('metodo_pago', 80)->nullable();
                $table->string('referencia_pago', 150)->nullable()->index();
                $table->decimal('monto', 12, 2)->default(0);

                $table->foreign('id_usuario')->references('id_usuario')->on('tbl_usuario')->restrictOnDelete();
                $table->foreign('id_plan')->references('id_plan')->on('tbl_plan')->restrictOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_suscripcion');
        Schema::dropIfExists('tbl_ingreso');
        Schema::dropIfExists('tbl_costo');
        Schema::dropIfExists('tbl_produccion');
        Schema::dropIfExists('tbl_plaga_cultivo');
        Schema::dropIfExists('tbl_actividad');
        Schema::dropIfExists('tbl_inventario');
        Schema::dropIfExists('tbl_cultivo');
        Schema::dropIfExists('tbl_finca');
        Schema::dropIfExists('tbl_plaga_registrada');
        Schema::dropIfExists('tbl_fertilizante_registrado');
        Schema::dropIfExists('tbl_plaguicida_registrado');
        Schema::dropIfExists('tbl_usuario');
        Schema::dropIfExists('tbl_plan');
    }
};
