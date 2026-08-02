<?php

namespace App\Providers;

use Carbon\CarbonInterval;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Laravel\Passport\Passport;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Passport::tokensExpireIn(
            CarbonInterval::days(config('security.passport.access_token_days'))
        );
        Passport::refreshTokensExpireIn(
            CarbonInterval::days(config('security.passport.refresh_token_days'))
        );
        Passport::personalAccessTokensExpireIn(
            CarbonInterval::days(config('security.passport.personal_access_token_days'))
        );

        RateLimiter::for('login', function (Request $request) {
            $identifier = Str::lower((string) $request->input('acceso'));

            return Limit::perMinute(5)->by($identifier.'|'.$request->ip());
        });

        RateLimiter::for('registration', function (Request $request) {
            return Limit::perMinute(3)->by($request->ip());
        });
    }
}
