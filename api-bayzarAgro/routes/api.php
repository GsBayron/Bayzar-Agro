<?php

use App\Http\Controllers\Api\ActividadController;
use App\Http\Controllers\Api\AlertaController;
use App\Http\Controllers\Api\ClimaController;
use App\Http\Controllers\Api\CostoController;
use App\Http\Controllers\Api\CultivoController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FertilizanteRegistradoController;
use App\Http\Controllers\Api\FincaController;
use App\Http\Controllers\Api\IngresoController;
use App\Http\Controllers\Api\InventarioController;
use App\Http\Controllers\Api\PlagaCultivoController;
use App\Http\Controllers\Api\PlagaRegistradaController;
use App\Http\Controllers\Api\PlaguicidaRegistradoController;
use App\Http\Controllers\Api\ProduccionController;
use App\Http\Controllers\Api\Publico\PlanPublicoController;
use App\Http\Controllers\Api\Publico\RegistroController;
use App\Http\Controllers\Api\ReporteController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;

// RUTAS PUBLICAS

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:login');

Route::prefix('public')->group(function () {
    Route::get('/planes', [PlanPublicoController::class, 'listar'])
        ->middleware('throttle:60,1');
});

Route::post('/registro', [RegistroController::class, 'registrar'])
    ->middleware('throttle:registration');

Route::middleware([
    'auth:api',
    'rol.valido',
    'rol:Administrador',
])
    ->group(function () {

        // USUARIOS
        Route::prefix('usuario')->group(function () {
            Route::get('listar', [UsuarioController::class, 'listar']);
            Route::get('consultar/{id}', [UsuarioController::class, 'consultar']);
            Route::post('guardar', [UsuarioController::class, 'guardar']);
            Route::put('actualizar', [UsuarioController::class, 'actualizar']);
            Route::delete('eliminar/{id}', [UsuarioController::class, 'eliminar']);
        });
    });

Route::middleware(['auth:api', 'rol.valido'])->group(function () {

    // DASHBOARD
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // CLIMA
    Route::get('/clima/finca/{id}', [ClimaController::class, 'finca']);

    // AUTH
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/perfil', [AuthController::class, 'perfil']);

    // ALERTAS
    Route::get('/alertas', [AlertaController::class, 'listar']);

    // PERFIL
    Route::put('/perfil', [AuthController::class, 'actualizarPerfil']);

    // REGISTROS DEL SERVICIO FITOSANITARIO DEL ESTADO
    // Route::get('/plaguicidas-registrados', [PlaguicidaRegistradoController::class, 'listar']);
    // Route::get('/fertilizantes-registrados', [FertilizanteRegistradoController::class, 'listar']);
    // Route::get('/plagas-registradas', [PlagaRegistradaController::class, 'listar']);

    // FINCAS
    Route::prefix('fincas')->group(function () {
        Route::get('/', [FincaController::class, 'listar']);
        Route::get('/{id}', [FincaController::class, 'consultar']);
        Route::post('/', [FincaController::class, 'guardar']);
        Route::put('/{id}', [FincaController::class, 'actualizar']);
        Route::delete('/{id}', [FincaController::class, 'eliminar']);
    });

    // CULTIVOS
    Route::prefix('cultivos')->group(function () {
        Route::get('/', [CultivoController::class, 'listar']);
        Route::get('/{id}', [CultivoController::class, 'consultar']);
        Route::post('/', [CultivoController::class, 'guardar']);
        Route::put('/{id}', [CultivoController::class, 'actualizar']);
        Route::delete('/{id}', [CultivoController::class, 'eliminar']);
    });

    // INVENTARIO
    Route::prefix('inventario')->group(function () {
        Route::get('/', [InventarioController::class, 'listar']);
        Route::get('/{id}', [InventarioController::class, 'consultar']);
        Route::post('/', [InventarioController::class, 'guardar']);
        Route::post('/lote', [InventarioController::class, 'guardarLote']);
        Route::put('/{id}', [InventarioController::class, 'actualizar']);
        Route::delete('/{id}', [InventarioController::class, 'eliminar']);
    });

    // PLAGAS DE CULTIVOS
    Route::prefix('plagas-cultivo')->group(function () {
        Route::get('/', [PlagaCultivoController::class, 'listar']);
        Route::get('/{id}', [PlagaCultivoController::class, 'consultar']);
        Route::post('/', [PlagaCultivoController::class, 'guardar']);
        Route::put('/{id}', [PlagaCultivoController::class, 'actualizar']);
        Route::delete('/{id}', [PlagaCultivoController::class, 'eliminar']);
    });

    // ACTIVIDADES
    Route::prefix('actividades')->group(function () {
        Route::get('/', [ActividadController::class, 'listar']);
        Route::get('/{id}', [ActividadController::class, 'consultar']);
        Route::post('/', [ActividadController::class, 'guardar']);
        Route::put('/{id}', [ActividadController::class, 'actualizar']);
        Route::delete('/{id}', [ActividadController::class, 'eliminar']);
    });

    // PLAGUICIDAS REGISTRADOS
    Route::prefix('plaguicidas-registrados')->group(function () {
        Route::get('/', [PlaguicidaRegistradoController::class, 'listar']);
        Route::get('/{id}', [PlaguicidaRegistradoController::class, 'consultar']);
        Route::post('/', [PlaguicidaRegistradoController::class, 'guardar'])->middleware('rol:Administrador');
        Route::put('/{id}', [PlaguicidaRegistradoController::class, 'actualizar'])->middleware('rol:Administrador');
        Route::delete('/{id}', [PlaguicidaRegistradoController::class, 'eliminar'])->middleware('rol:Administrador');
    });

    // FERTILIZANTES REGISTRADOS
    Route::prefix('fertilizantes-registrados')->group(function () {
        Route::get('/', [FertilizanteRegistradoController::class, 'listar']);
        Route::get('/{id}', [FertilizanteRegistradoController::class, 'consultar']);
        Route::post('/', [FertilizanteRegistradoController::class, 'guardar'])->middleware('rol:Administrador');
        Route::put('/{id}', [FertilizanteRegistradoController::class, 'actualizar'])->middleware('rol:Administrador');
        Route::delete('/{id}', [FertilizanteRegistradoController::class, 'eliminar'])->middleware('rol:Administrador');
    });

    // PLAGAS REGISTRADAS
    Route::prefix('plagas-registradas')->group(function () {
        Route::get('/', [PlagaRegistradaController::class, 'listar']);
        Route::get('/{id}', [PlagaRegistradaController::class, 'consultar']);
        Route::post('/', [PlagaRegistradaController::class, 'guardar'])->middleware('rol:Administrador');
        Route::put('/{id}', [PlagaRegistradaController::class, 'actualizar'])->middleware('rol:Administrador');
        Route::delete('/{id}', [PlagaRegistradaController::class, 'eliminar'])->middleware('rol:Administrador');
    });

    // COSTOS
    Route::prefix('costos')->group(function () {
        Route::get('/', [CostoController::class, 'listar']);
        Route::get('/{id}', [CostoController::class, 'consultar']);
        Route::post('/', [CostoController::class, 'guardar']);
        Route::put('/{id}', [CostoController::class, 'actualizar']);
        Route::delete('/{id}', [CostoController::class, 'eliminar']);
    });

    // PRODUCCION
    Route::prefix('produccion')->group(function () {
        Route::get('/', [ProduccionController::class, 'listar']);
        Route::get('/{id}', [ProduccionController::class, 'consultar']);
        Route::post('/', [ProduccionController::class, 'guardar']);
        Route::put('/{id}', [ProduccionController::class, 'actualizar']);
        Route::delete('/{id}', [ProduccionController::class, 'eliminar']);
    });

    // INGRESOS
    Route::prefix('ingresos')->group(function () {
        Route::get('/', [IngresoController::class, 'listar']);
        Route::get('/{id}', [IngresoController::class, 'consultar']);
        Route::post('/', [IngresoController::class, 'guardar']);
        Route::put('/{id}', [IngresoController::class, 'actualizar']);
        Route::delete('/{id}', [IngresoController::class, 'eliminar']);
    });

    // REPORTES
    Route::prefix('reportes')->group(function () {
        Route::get('/financiero', [ReporteController::class, 'financiero']);
    });
});
