<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\Api\FincaController;
use App\Http\Controllers\Api\CultivoController;
use App\Http\Controllers\Api\ActividadController;
use App\Http\Controllers\Api\InventarioController;
use App\Http\Controllers\Api\PlaguicidaRegistradoController;
use App\Http\Controllers\Api\FertilizanteRegistradoController;
use App\Http\Controllers\Api\PlagaRegistradaController;
use App\Http\Controllers\Api\PlagaCultivoController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ClimaController;

/*Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');*/

Route::post('/login', [AuthController::class, 'login']);

Route::middleware([
    'auth:api',
    'rol:Administrador'
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

Route::middleware(['auth:api']) -> group(function () {

        // DASHBOARD
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // CLIMA
        Route::get('/clima/finca/{id}', [ClimaController::class, 'finca']);

        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/perfil', [AuthController::class, 'perfil']);

        // REGISTROS DEL SERVICIO FITOSANITARIO DEL ESTADO
        Route::get('/plaguicidas-registrados', [PlaguicidaRegistradoController::class, 'listar']);
        Route::get('/fertilizantes-registrados', [FertilizanteRegistradoController::class, 'listar']);
        Route::get('/plagas-registradas', [PlagaRegistradaController::class, 'listar']);


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
    });
