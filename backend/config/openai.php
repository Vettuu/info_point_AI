<?php

return [
    'api_key' => env('OPENAI_API_KEY', ''),
    'model' => env('OPENAI_MODEL', 'gpt-4.1-mini'),
    'embedding_model' => env('OPENAI_EMBEDDING_MODEL', 'text-embedding-3-small'),
    'knowledge_index_path' => base_path(env('KNOWLEDGE_INDEX_PATH', 'storage/app/knowledge_index.json')),
    'knowledge_source_path' => base_path(env('KNOWLEDGE_SOURCE_PATH', 'resources/knowledge')),
];
