<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\Api\FincaController;

/*Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');*/

Route::post('/login', [AuthController::class, 'login']);

Route::middleware([
    'auth:api', 
    'rol:Administrador'])
    ->group(function () {
   
    // USUARIOS
    Route::prefix('usuario')->group(function () {
        Route::get('listar', [UsuarioController::class, 'listar']);
        Route::get('consultar/{id}', [UsuarioController::class, 'consultar']);
        Route::post('guardar', [UsuarioController::class, 'guardar']);
        Route::put('actualizar', [UsuarioController::class, 'actualizar']);
        Route::delete('eliminar/{id}', [UsuarioController::class, 'eliminar']);
    });

    // FINCAS
    Route::prefix('fincas')->group(function () {
        Route::get('/', [FincaController::class, 'listar']);
        Route::get('/{id}', [FincaController::class, 'consultar']);
        Route::post('/', [FincaController::class, 'guardar']);
        Route::put('/{id}', [FincaController::class, 'actualizar']);
        Route::delete('/{id}', [FincaController::class, 'eliminar']);
    });

});

Route::middleware([
    'auth:api'])
    ->group(function () {
         Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/perfil', [AuthController::class, 'perfil']);
});