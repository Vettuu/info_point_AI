<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

ini_set('upload_max_filesize', env('UPLOAD_MAX_FILESIZE', '20M'));
ini_set('post_max_size', env('POST_MAX_SIZE', '20M'));
ini_set('max_input_time', env('MAX_INPUT_TIME', '120'));
ini_set('max_execution_time', env('MAX_EXECUTION_TIME', '120'));
ini_set('memory_limit', env('MEMORY_LIMIT', '256M'));

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
