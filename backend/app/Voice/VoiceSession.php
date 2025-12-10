<?php

namespace App\Voice;

use SplQueue;

class VoiceSession
{
    public string $id;
    public bool $assistantSpeaking = false;
    public SplQueue $audioChunks;
    public ?string $currentTranscript = null;

    public function __construct(string $id)
    {
        $this->id = $id;
        $this->audioChunks = new SplQueue();
    }

    public function reset(): void
    {
        $this->assistantSpeaking = false;
        $this->currentTranscript = null;
        $this->audioChunks = new SplQueue();
    }
}
