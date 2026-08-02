<?php

return [
    'initial_admin' => [
        'email' => env('INITIAL_ADMIN_EMAIL', 'admin@bayzaragro.demo'),
        'username' => env('INITIAL_ADMIN_USERNAME', 'admin'),
        'password' => env('INITIAL_ADMIN_PASSWORD'),
        'name' => env('INITIAL_ADMIN_NAME', 'Administrador'),
        'last_name' => env('INITIAL_ADMIN_LAST_NAME', 'Demo'),
    ],
];
