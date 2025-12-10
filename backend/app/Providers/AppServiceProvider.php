<?php

namespace App\Providers;

use App\Voice\SessionManager;
use App\Voice\VoiceAssistantWebSocket;
use Illuminate\Http\Request;
use Illuminate\Support\ServiceProvider;
use Laravel\Octane\Facades\Octane;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(SessionManager::class, fn () => new SessionManager());
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (class_exists(Octane::class)) {
            Octane::route('GET', '/ws/voice-assistant', function (Request $request) {
                return app(VoiceAssistantWebSocket::class)($request);
            });

            Octane::route('POST', '/ws/voice-assistant', function (Request $request) {
                return app(VoiceAssistantWebSocket::class)($request);
            });
        }
    }
}
