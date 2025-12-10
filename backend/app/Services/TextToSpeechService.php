<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use InvalidArgumentException;
use OpenAI;
use RuntimeException;

class TextToSpeechService
{
    private \OpenAI\Client $client;
    private string $model;
    private string $voice;

    public function __construct()
    {
        $apiKey = config('openai.api_key');
        if (blank($apiKey)) {
            throw new InvalidArgumentException('OPENAI_API_KEY non configurata.');
        }

        $this->client = OpenAI::client($apiKey);
        $voiceConfig = config('openai.voice');
        $this->model = $voiceConfig['tts_model'] ?? 'gpt-4o-mini-tts';
        $this->voice = $voiceConfig['voice'] ?? 'alloy';
    }

    public function synthesize(string $text, string $format = 'mp3'): string
    {
        $response = $this->client->audio()->speech([
            'model' => $this->model,
            'voice' => $this->voice,
            'input' => $text,
            'format' => $format,
        ]);

        if (!$response) {
            throw new RuntimeException('Risposta TTS vuota.');
        }

        return base64_encode($response);
    }
}
