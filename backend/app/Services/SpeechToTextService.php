<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use InvalidArgumentException;
use OpenAI;
use RuntimeException;

class SpeechToTextService
{
    private \OpenAI\Client $client;
    private string $model;
    private string $language;

    public function __construct()
    {
        $apiKey = config('openai.api_key');
        if (blank($apiKey)) {
            throw new InvalidArgumentException('OPENAI_API_KEY non configurata.');
        }

        $this->client = OpenAI::client($apiKey);
        $voiceConfig = config('openai.voice');
        $this->model = $voiceConfig['stt_model'] ?? 'gpt-4o-mini-transcribe';
        $this->language = $voiceConfig['language'] ?? 'it';
    }

    public function transcribe(string $path): string
    {
        if (!File::exists($path)) {
            throw new RuntimeException('File audio non trovato.');
        }

        $response = $this->client->audio()->transcribe([
            'model' => $this->model,
            'file' => fopen($path, 'r'),
            'response_format' => 'json',
            'language' => $this->language,
            'temperature' => 0.2,
        ]);

        $text = $response->text ?? null;

        if (!$text) {
            throw new RuntimeException('Trascrizione non disponibile.');
        }

        return trim($text);
    }
}
