<?php

namespace App\Services;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;
use InvalidArgumentException;
use OpenAI;
use RuntimeException;

class InfoPointAssistant
{
    private \OpenAI\Client $client;
    private string $indexPath;
    private string $model;
    private string $embeddingModel;
    private int $maxOutputTokens;

    public function __construct()
    {
        $apiKey = config('openai.api_key');

        if (blank($apiKey)) {
            throw new InvalidArgumentException('OPENAI_API_KEY non configurata.');
        }

        $this->client = OpenAI::client($apiKey);
        $this->indexPath = config('openai.knowledge_index_path');
        $this->model = config('openai.model', 'gpt-4o-mini');
        $this->embeddingModel = config('openai.embedding_model', 'text-embedding-3-small');
        $this->maxOutputTokens = (int) config('openai.max_output_tokens', 450);
    }

    public function answer(string $question): array
    {
        if (!File::exists($this->indexPath)) {
            throw new RuntimeException('Indice conoscenza non trovato. Esegui il comando app:build-knowledge-index.');
        }

        $documents = json_decode(File::get($this->indexPath), true) ?? [];

        if (empty($documents)) {
            throw new RuntimeException('Indice conoscenza vuoto.');
        }

        $queryEmbedding = $this->client->embeddings()->create([
            'model' => $this->embeddingModel,
            'input' => $question,
        ])->embeddings[0]->embedding ?? [];

        $ranked = $this->rankDocuments($documents, $queryEmbedding);
        $topDocuments = array_slice($ranked, 0, 3);
        $context = $this->buildContextPrompt($topDocuments);

        $prompt = "Sei Info Point AI. Usa esclusivamente il seguente contesto per rispondere in italiano.\n" .
            "Contesto:\n" . $context . "\n\nDomanda:\n" . $question;

        $payload = [
            'model' => $this->model,
            'input' => $prompt,
        ];

        if ($this->maxOutputTokens > 0) {
            $payload['max_output_tokens'] = $this->maxOutputTokens;
        }

        $response = $this->client->responses()->create($payload);

        $answer = Arr::get($response, 'output.0.content.0.text');

        return [
            'answer' => trim($answer ?? ''),
            'sources' => array_map(fn ($doc) => Arr::only($doc, ['id', 'title', 'summary', 'path']), $topDocuments),
        ];
    }

    private function rankDocuments(array $documents, array $queryEmbedding): array
    {
        $scored = [];

        foreach ($documents as $document) {
            $score = $this->cosineSimilarity($queryEmbedding, $document['embedding'] ?? []);
            $document['score'] = $score;
            $scored[] = $document;
        }

        usort($scored, fn ($a, $b) => $b['score'] <=> $a['score']);

        return $scored;
    }

    private function cosineSimilarity(array $vectorA, array $vectorB): float
    {
        if (empty($vectorA) || empty($vectorB)) {
            return 0.0;
        }

        $dotProduct = 0.0;
        $magnitudeA = 0.0;
        $magnitudeB = 0.0;
        $length = min(count($vectorA), count($vectorB));

        for ($i = 0; $i < $length; $i++) {
            $dotProduct += $vectorA[$i] * $vectorB[$i];
            $magnitudeA += $vectorA[$i] ** 2;
            $magnitudeB += $vectorB[$i] ** 2;
        }

        if ($magnitudeA === 0.0 || $magnitudeB === 0.0) {
            return 0.0;
        }

        return $dotProduct / (sqrt($magnitudeA) * sqrt($magnitudeB));
    }

    private function buildContextPrompt(array $documents): string
    {
        return collect($documents)
            ->map(function ($doc) {
                $header = "Documento: {$doc['title']} ({$doc['id']})";
                $body = trim($doc['content']);

                return $header . "\n" . $body;
            })
            ->join("\n---\n");
    }
}
