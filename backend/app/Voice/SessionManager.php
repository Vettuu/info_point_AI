<?php

namespace App\Voice;

use Illuminate\Support\Str;

class SessionManager
{
    /**
     * @var array<string, VoiceSession>
     */
    protected array $sessions = [];

    public function create(): VoiceSession
    {
        $session = new VoiceSession(Str::uuid()->toString());

        $this->sessions[$session->id] = $session;

        return $session;
    }

    public function get(string $id): ?VoiceSession
    {
        return $this->sessions[$id] ?? null;
    }

    public function reset(string $id): ?VoiceSession
    {
        $session = $this->sessions[$id] ?? null;

        if ($session) {
            $session->reset();
        }

        return $session;
    }

    public function forget(string $id): void
    {
        unset($this->sessions[$id]);
    }

    /**
     * @return array<string, VoiceSession>
     */
    public function all(): array
    {
        return $this->sessions;
    }
}
