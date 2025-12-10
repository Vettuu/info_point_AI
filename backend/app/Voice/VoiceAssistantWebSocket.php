<?php

namespace App\Voice;

use App\Voice\Exceptions\VoicePipelineException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class VoiceAssistantWebSocket
{
    public function __construct(
        protected SessionManager $sessions,
        protected VoicePipelineService $pipeline
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        if ($request->getMethod() === 'POST') {
            return $this->handleHttpMessage($request);
        }

        $session = $this->sessions->create();

        return response()->json([
            'sessionId' => $session->id,
            'status' => 'pending',
            'message' => 'WebSocket transport not yet implemented. Use POST with payloads for early testing.',
        ], 501);
    }

    protected function handleHttpMessage(Request $request): JsonResponse
    {
        $sessionId = $request->input('sessionId');
        $type = $request->input('type');

        if (! $sessionId || ! $type) {
            return response()->json(['status' => 'error', 'message' => 'Missing sessionId or type'], 422);
        }

        $session = $this->sessions->get($sessionId);

        if (! $session) {
            return response()->json(['status' => 'error', 'message' => 'Session not found'], 404);
        }

        try {
            switch ($type) {
                case 'audio_chunk':
                    $chunk = (string) $request->input('data', '');
                    $this->pipeline->handleAudioChunk($session, $chunk);

                    return response()->json(['status' => 'chunk_stored']);
                case 'user_stop':
                    $payload = $this->pipeline->handleUserStop($session);

                    return response()->json([
                        'status' => 'completed',
                        'question' => $payload['question'],
                        'answer' => $payload['answer'],
                        'audio' => $payload['audio'],
                        'sources' => $payload['sources'],
                    ]);
                case 'user_cancel':
                    $this->pipeline->handleUserCancel($session);

                    return response()->json(['status' => 'reset']);
                default:
                    Log::warning('[voice] unsupported message type', ['type' => $type]);

                    return response()->json(['status' => 'error', 'message' => 'Unsupported type'], 422);
            }
        } catch (VoicePipelineException $pipelineException) {
            Log::warning('[voice] pipeline exception', [
                'session' => $sessionId,
                'type' => $pipelineException->type,
                'message' => $pipelineException->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'type' => $pipelineException->type,
                'message' => $pipelineException->getMessage(),
            ], 422);
        } catch (Throwable $exception) {
            Log::error('[voice] unhandled exception', [
                'session' => $sessionId,
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Errore inatteso del servizio vocale.',
            ], 500);
        }
    }

    /**
     * Placeholders for upcoming WebSocket integration.
     */
    public function handleOpen(VoiceSession $session, mixed $connection): void
    {
        Log::info('[voice] session opened', ['session' => $session->id]);
    }

    public function handleMessage(VoiceSession $session, array $payload): void
    {
        // once WebSocket transport is wired, call pipeline methods here
    }

    public function handleClose(VoiceSession $session): void
    {
        $this->sessions->forget($session->id);
        Log::info('[voice] session closed', ['session' => $session->id]);
    }
}
