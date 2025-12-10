<?php
require __DIR__ . '/vendor/autoload.php';
Dotenv\Dotenv::createUnsafeImmutable(__DIR__)->load();
ini_set('upload_max_filesize', env('UPLOAD_MAX_FILESIZE', '20M'));
ini_set('post_max_size', env('POST_MAX_SIZE', '20M'));
ini_set('max_input_time', env('MAX_INPUT_TIME', '120'));
ini_set('max_execution_time', env('MAX_EXECUTION_TIME', '120'));
phpinfo();
