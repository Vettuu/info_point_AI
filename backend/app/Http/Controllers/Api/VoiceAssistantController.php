<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\InfoPointAssistant;
use App\Services\SpeechToTextService;
use App\Services\TextToSpeechService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Throwable;

class VoiceAssistantController extends Controller
{
    public function __invoke(
        Request $request,
        SpeechToTextService $speechToText,
        InfoPointAssistant $assistant,
        TextToSpeechService $textToSpeech
    ): Response {
        $validated = $request->validate([
            'audio' => [
                'required',
                'file',
                'max:20480', // ~20MB
                'mimetypes:audio/webm,video/webm,audio/wav,audio/mpeg,audio/mp4,audio/ogg,audio/x-m4a',
            ],
        ]);

        $path = $request->file('audio')->store('voice-inputs');
        $fullPath = Storage::path($path);

        try {
            \Log::info('Voice assistant request', [
                'path' => $path,
                'ip' => $request->ip(),
                'ua' => $request->userAgent(),
            ]);

            $transcribed = $speechToText->transcribe($fullPath);
            $assistantResult = $assistant->answer($transcribed);
            $audioBase64 = null;

            try {
                $audioBase64 = $textToSpeech->synthesize($assistantResult['answer']);
            } catch (Throwable $ttsException) {
                report($ttsException);
            }

            return response([
                'question' => $transcribed,
                'answer' => $assistantResult['answer'],
                'audio' => $audioBase64,
                'sources' => $assistantResult['sources'],
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response([
                'message' => 'Impossibile elaborare la richiesta vocale.',
                'error' => $exception->getMessage(),
            ], 422);
        } finally {
            Storage::delete($path);
        }
    }
}
