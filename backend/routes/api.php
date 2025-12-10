<?php

use App\Http\Controllers\Api\AssistantController;
use App\Http\Controllers\Api\VoiceAssistantController;
use Illuminate\Support\Facades\Route;

Route::post('/assistant', AssistantController::class);
Route::post('/voice-assistant', VoiceAssistantController::class);
