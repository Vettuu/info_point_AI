<?php

namespace App\Voice;

use App\Services\InfoPointAssistant;
use App\Services\SpeechToTextService;
use App\Services\TextToSpeechService;
use App\Voice\Exceptions\VoicePipelineException;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class VoicePipelineService
{
    public function __construct(
        protected SpeechToTextService $speechToText,
        protected TextToSpeechService $textToSpeech,
        protected InfoPointAssistant $assistant
    ) {
    }

    public function handleAudioChunk(VoiceSession $session, string $chunkBase64): void
    {
        if ($chunkBase64 === '') {
            return;
        }

        $session->audioChunks->enqueue($chunkBase64);

        Log::debug('[voice] chunk received', [
            'session' => $session->id,
            'queue' => $session->audioChunks->count(),
        ]);

        $maxBufferedChunks = 10; // ~= 2s con chunk da 200ms
        while ($session->audioChunks->count() > $maxBufferedChunks) {
            $session->audioChunks->dequeue();
            Log::debug('[voice] dropping stale chunk', ['session' => $session->id]);
        }
    }

    public function handleUserStop(VoiceSession $session): array
    {
        Log::info('[voice] user_stop received', ['session' => $session->id]);

        if ($session->audioChunks->count() === 0) {
            throw new VoicePipelineException('audio_missing', 'Non ho ricevuto audio da trascrivere.');
        }

        $audioPath = $this->flushChunksToFile($session);

        try {
            $transcript = $this->speechToText->transcribe($audioPath);
        } catch (Throwable $exception) {
            File::delete($audioPath);
            throw new VoicePipelineException('stt_failed', 'Non riesco a trascrivere la tua voce, riprova.', $exception);
        }

        File::delete($audioPath);

        $session->currentTranscript = $transcript;

        try {
            $answerData = $this->assistant->answer($transcript);
        } catch (Throwable $exception) {
            throw new VoicePipelineException('assistant_failed', 'Si è verificato un errore nella generazione della risposta.', $exception);
        }

        $answerText = $answerData['answer'] ?? '';
        $sources = $answerData['sources'] ?? [];

        $audioBase64 = null;

        if ($answerText !== '') {
            try {
                $audioBase64 = $this->textToSpeech->synthesize($answerText, 'mp3');
                $session->assistantSpeaking = true;
            } catch (Throwable $exception) {
                Log::warning('[voice] TTS fallita', [
                    'session' => $session->id,
                    'message' => $exception->getMessage(),
                ]);
            }
        }

        $session->audioChunks = new \SplQueue();

        return [
            'question' => $transcript,
            'answer' => $answerText,
            'audio' => $audioBase64,
            'sources' => $sources,
        ];
    }

    public function handleUserCancel(VoiceSession $session): void
    {
        Log::info('[voice] user_cancel received', ['session' => $session->id]);
        $session->reset();
    }

    protected function flushChunksToFile(VoiceSession $session): string
    {
        $directory = storage_path('app/voice-inputs');
        File::ensureDirectoryExists($directory);

        $path = $directory.'/'.Str::uuid().'.webm';

        $resource = fopen($path, 'wb');

        while (! $session->audioChunks->isEmpty()) {
            $chunk = $session->audioChunks->dequeue();
            fwrite($resource, base64_decode($chunk));
        }

        fclose($resource);

        return $path;
    }
}
