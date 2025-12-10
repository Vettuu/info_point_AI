<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::middleware(['web'])->group(function () {
    Route::get('/docs/agenda-browser', function () {
        $path = base_path('resources/knowledge/programma_congresso_chirurgia_demo.pdf');
        abort_unless(File::exists($path), 404);

        return response()->file($path, [
            'Content-Type' => 'application/pdf',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    });

    Route::get('/docs/piantina-browser', function () {
        $path = base_path('resources/knowledge/piantina_centro_congressi_demo.pdf');
        abort_unless(File::exists($path), 404);

        return response()->file($path, [
            'Content-Type' => 'application/pdf',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    });
});

Route::get('/docs/agenda', function () {
    $path = base_path('resources/knowledge/programma_congresso_chirurgia_demo.pdf');
    abort_unless(File::exists($path), 404);

    return response()->file($path, [
        'Content-Type' => 'application/pdf',
        'Cache-Control' => 'public, max-age=86400',
    ]);
});

Route::get('/docs/piantina', function () {
    $path = base_path('resources/knowledge/piantina_centro_congressi_demo.pdf');
    abort_unless(File::exists($path), 404);

    return response()->file($path, [
        'Content-Type' => 'application/pdf',
        'Cache-Control' => 'public, max-age=86400',
    ]);
});
