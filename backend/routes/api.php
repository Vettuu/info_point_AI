<?php

use App\Http\Controllers\Api\AssistantController;
use Illuminate\Support\Facades\Route;

Route::post('/assistant', AssistantController::class);
