<?php

namespace App\Voice\Exceptions;

use RuntimeException;
use Throwable;

class VoicePipelineException extends RuntimeException
{
    public function __construct(public string $type, string $message, ?Throwable $previous = null)
    {
        parent::__construct($message, 0, $previous);
    }
}
