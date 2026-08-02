<?php

return [
    'passport' => [
        'access_token_days' => max(1, (int) env('PASSPORT_ACCESS_TOKEN_DAYS', 1)),
        'refresh_token_days' => max(1, (int) env('PASSPORT_REFRESH_TOKEN_DAYS', 30)),
        'personal_access_token_days' => max(1, (int) env('PASSPORT_PERSONAL_ACCESS_TOKEN_DAYS', 1)),
    ],

    'hsts_max_age' => max(0, (int) env('SECURITY_HSTS_MAX_AGE', 31536000)),
    'hsts_include_subdomains' => filter_var(
        env('SECURITY_HSTS_INCLUDE_SUBDOMAINS', false),
        FILTER_VALIDATE_BOOL
    ),
];
