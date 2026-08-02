<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeadersMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        if ($request->is('api/*')) {
            $response->headers->set('Cache-Control', 'no-store, private');
            $response->headers->set(
                'Content-Security-Policy',
                "default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
            );
        }

        if (app()->environment('production') && $request->isSecure()) {
            $maxAge = max(0, (int) config('security.hsts_max_age'));

            if ($maxAge > 0) {
                $hsts = "max-age={$maxAge}";

                if (config('security.hsts_include_subdomains')) {
                    $hsts .= '; includeSubDomains';
                }

                $response->headers->set(
                    'Strict-Transport-Security',
                    $hsts
                );
            }
        }

        return $response;
    }
}
