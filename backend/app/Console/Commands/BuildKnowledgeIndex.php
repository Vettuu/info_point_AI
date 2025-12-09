<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use OpenAI;

class BuildKnowledgeIndex extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:build-knowledge-index';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Genera l\'indice locale per i contenuti dell\'Info Point AI';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $apiKey = config('openai.api_key');

        if (empty($apiKey)) {
            $this->error('OPENAI_API_KEY non è configurata nel file .env');
            return self::FAILURE;
        }

        $sourcePath = config('openai.knowledge_source_path');
        $indexPath = config('openai.knowledge_index_path');
        $embeddingModel = config('openai.embedding_model', 'text-embedding-3-small');

        if (!File::exists($sourcePath)) {
            $this->error("Cartella sorgente non trovata: {$sourcePath}");
            return self::FAILURE;
        }

        $documents = $this->loadDocuments($sourcePath);

        if (empty($documents)) {
            $this->warn('Nessun documento trovato da indicizzare.');
            return self::SUCCESS;
        }

        $client = OpenAI::client($apiKey);
        $indexed = [];

        foreach ($documents as $document) {
            $this->info("Indicizzo {$document['id']} ({$document['title']})");

            $response = $client->embeddings()->create([
                'model' => $embeddingModel,
                'input' => $document['content'],
            ]);

            $embedding = Arr::get($response->embeddings[0], 'embedding', []);

            $indexed[] = [
                'id' => $document['id'],
                'title' => $document['title'],
                'tags' => $document['tags'],
                'path' => $document['path'],
                'summary' => $document['summary'],
                'content' => $document['content'],
                'embedding' => $embedding,
            ];
        }

        File::ensureDirectoryExists(dirname($indexPath));
        File::put($indexPath, json_encode($indexed, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $this->info('Indice salvato in ' . $indexPath);

        return self::SUCCESS;
    }

    private function loadDocuments(string $sourcePath): array
    {
        $metadataPath = $sourcePath . DIRECTORY_SEPARATOR . 'metadata.json';
        $documents = [];

        if (File::exists($metadataPath)) {
            $metadata = json_decode(File::get($metadataPath), true) ?? [];

            foreach ($metadata as $entry) {
                $file = Arr::get($entry, 'file');
                $filePath = $sourcePath . DIRECTORY_SEPARATOR . $file;

                if (!$file || !File::exists($filePath)) {
                    $this->warn("File mancante per l'entry " . Arr::get($entry, 'id', 'sconosciuta'));
                    continue;
                }

                $documents[] = [
                    'id' => Arr::get($entry, 'id', Str::uuid()->toString()),
                    'title' => Arr::get($entry, 'title', Str::title(pathinfo($file, PATHINFO_FILENAME))),
                    'tags' => Arr::get($entry, 'tags', []),
                    'summary' => Arr::get($entry, 'summary', ''),
                    'path' => Str::after($filePath, base_path() . DIRECTORY_SEPARATOR),
                    'content' => File::get($filePath),
                ];
            }
        }

        if (empty($documents)) {
            foreach (File::allFiles($sourcePath) as $file) {
                if ($file->getExtension() !== 'md' && $file->getExtension() !== 'txt') {
                    continue;
                }

                $relativePath = Str::after($file->getRealPath(), base_path() . DIRECTORY_SEPARATOR);

                $documents[] = [
                    'id' => Str::slug($file->getFilename(), '-') . '-' . $file->getSize(),
                    'title' => Str::title(str_replace(['-', '_'], ' ', $file->getFilenameWithoutExtension())),
                    'tags' => [],
                    'summary' => '',
                    'path' => $relativePath,
                    'content' => File::get($file->getRealPath()),
                ];
            }
        }

        return $documents;
    }
}
