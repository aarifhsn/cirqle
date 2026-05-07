<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

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
        RateLimiter::for('login', function (Request $request) {
            // Key = lowercased email + IP — so per-account AND per-IP
            $key = str($request->input('email'))->lower()->value()
                . '|' . $request->ip();

            return Limit::perMinutes(15, 5)   // 5 attempts per 15 minutes
                ->by($key)
                ->response(function () {
                    return response()->json([
                        'message' => 'Too many login attempts. Please try again in 15 minutes.',
                        'retry_after' => 15 * 60,   // seconds — frontend can use this
                    ], 429);
                });
        });
    }
}
