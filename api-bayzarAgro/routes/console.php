<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schedule;
use App\Models\Plan;
use App\Models\Usuario;
use Laravel\Passport\ClientRepository;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('bayzar:setup', function () {
    $this->components->info('Inicializando BayzarAgro...');

    $migrationExitCode = $this->call('migrate', [
        '--force' => true,
        '--seed' => true,
    ]);

    if ($migrationExitCode !== 0) {
        $this->components->error('No fue posible completar las migraciones.');

        return 1;
    }

    $provider = (string) config('auth.guards.api.provider', 'users');
    $clients = app(ClientRepository::class);

    try {
        $clients->personalAccessClient($provider);
        $this->components->info('El cliente personal de Passport ya existe.');
    } catch (RuntimeException) {
        $clients->createPersonalAccessGrantClient('BayzarAgro', $provider);
        $this->components->info('Cliente personal de Passport creado.');
    }

    $admin = config('deployment.initial_admin');
    $password = (string) ($admin['password'] ?? '');

    if (strlen($password) < 12) {
        $this->components->error(
            'INITIAL_ADMIN_PASSWORD es obligatorio y debe tener al menos 12 caracteres.'
        );

        return 1;
    }

    $plan = Plan::query()->where('codigo', 'profesional')->first();

    Usuario::query()->updateOrCreate(
        ['correo' => (string) $admin['email']],
        [
            'id_plan' => $plan?->id_plan,
            'nombre' => (string) $admin['name'],
            'apellidos' => (string) $admin['last_name'],
            'telefono' => null,
            'acceso' => (string) $admin['username'],
            'secreto' => Hash::make($password),
            'rol' => 'Administrador',
            'estado' => 1,
            'estado_pago' => 'Activo',
        ]
    );

    $this->components->info('Administrador inicial creado o actualizado.');
    $this->components->info('BayzarAgro quedó inicializado correctamente.');

    return 0;
})->purpose('Prepara la base de datos, Passport y el administrador inicial');

Schedule::command('passport:purge --hours=24')
    ->daily()
    ->withoutOverlapping();
