<?php

namespace App\Console\Commands;

use App\Voice\Exceptions\VoicePipelineException;
use App\Voice\SessionManager;
use App\Voice\VoicePipelineService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Swoole\WebSocket\Server as SwooleWebSocketServer;
use Throwable;

class VoiceWebSocketServer extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'voice:ws-server {--host=0.0.0.0} {--port=9000}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Start the Swoole WebSocket server for realtime voice interactions';

    /**
     * Execute the console command.
     */
    public function handle(SessionManager $sessions, VoicePipelineService $pipeline): int
    {
        if (! extension_loaded('swoole')) {
            $this->error('The Swoole PHP extension is required to run the WebSocket server.');

            return self::FAILURE;
        }

        $host = (string) $this->option('host');
        $port = (int) $this->option('port');
        $mode = defined('SWOOLE_BASE') ? SWOOLE_BASE : SWOOLE_PROCESS;

        $server = new SwooleWebSocketServer($host, $port, $mode);
        $connections = [];

        $server->on('open', function (SwooleWebSocketServer $server, $request) use (&$connections, $sessions) {
            $path = $request->server['request_uri'] ?? '/';
            if ($path !== '/ws/voice-assistant') {
                $server->disconnect($request->fd, 4000, 'Invalid path');

                return;
            }

            $session = $sessions->create();
            $connections[$request->fd] = $session->id;

            $server->push($request->fd, json_encode([
                'type' => 'session_started',
                'sessionId' => $session->id,
            ]));
        });

        $server->on('message', function (SwooleWebSocketServer $server, $frame) use (&$connections, $sessions, $pipeline) {
            $payload = json_decode($frame->data, true);

            if (! is_array($payload)) {
                $this->sendError($server, $frame->fd, 'invalid_payload', 'Payload non valido.');

                return;
            }

            $sessionId = $connections[$frame->fd] ?? $payload['sessionId'] ?? null;

            if (! $sessionId) {
                $this->sendError($server, $frame->fd, 'session_missing', 'Sessione non valida.');

                return;
            }

            if (! isset($connections[$frame->fd])) {
                $connections[$frame->fd] = $sessionId;
            }

            $session = $sessions->get($sessionId);

            if (! $session) {
                $session = $sessions->create();
                $connections[$frame->fd] = $session->id;
                $server->push($frame->fd, json_encode([
                    'type' => 'session_started',
                    'sessionId' => $session->id,
                ]));
            }

            $type = $payload['type'] ?? null;

            try {
                switch ($type) {
                    case 'audio_chunk':
                        $pipeline->handleAudioChunk($session, (string) ($payload['data'] ?? ''));

                        break;
                    case 'user_stop':
                        $response = $pipeline->handleUserStop($session);

                        $server->push($frame->fd, json_encode([
                            'type' => 'transcript',
                            'final' => true,
                            'text' => $response['question'] ?? '',
                        ]));

                        $hasAudio = ! empty($response['audio']);

                        $server->push($frame->fd, json_encode([
                            'type' => 'assistant_text',
                            'answer' => $response['answer'],
                            'sources' => $response['sources'],
                            'audioStreaming' => $hasAudio,
                        ]));

                        if ($hasAudio) {
                            $this->streamAudio($server, $frame->fd, $response['audio']);
                        } else {
                            $server->push($frame->fd, json_encode([
                                'type' => 'assistant_audio_end',
                            ]));
                        }

                        break;
                    case 'user_cancel':
                        $pipeline->handleUserCancel($session);

                        $server->push($frame->fd, json_encode([
                            'type' => 'assistant_paused',
                        ]));

                        break;
                    default:
                        $this->sendError($server, $frame->fd, 'unsupported', 'Tipo di messaggio non supportato.');
                }
            } catch (VoicePipelineException $exception) {
                Log::warning('[voice-ws] pipeline error', [
                    'session' => $sessionId,
                    'type' => $exception->type,
                    'message' => $exception->getMessage(),
                ]);
                $this->sendError($server, $frame->fd, $exception->type, $exception->getMessage());
            } catch (Throwable $throwable) {
                Log::error('[voice-ws] unhandled exception', [
                    'session' => $sessionId,
                    'message' => $throwable->getMessage(),
                ]);
                $this->sendError($server, $frame->fd, 'internal', 'Errore inatteso. Riprova.');
            }
        });

        $server->on('close', function (SwooleWebSocketServer $server, int $fd) use (&$connections, $sessions) {
            $sessionId = $connections[$fd] ?? null;

            if ($sessionId) {
                $sessions->forget($sessionId);
            }

            unset($connections[$fd]);
        });

        $this->info(sprintf('Voice WS server listening on ws://%s:%d', $host, $port));
        $server->start();

        return self::SUCCESS;
    }

    protected function streamAudio(SwooleWebSocketServer $server, int $fd, string $audioBase64): void
    {
        $chunkSize = 8192;
        $length = strlen($audioBase64);

        for ($offset = 0; $offset < $length; $offset += $chunkSize) {
            $server->push($fd, json_encode([
                'type' => 'assistant_audio_chunk',
                'data' => substr($audioBase64, $offset, $chunkSize),
            ]));
        }

        $server->push($fd, json_encode([
            'type' => 'assistant_audio_end',
        ]));
    }

    protected function sendError(SwooleWebSocketServer $server, int $fd, string $type, string $message): void
    {
        $server->push($fd, json_encode([
            'type' => 'error',
            'errorType' => $type,
            'message' => $message,
        ]));
    }
}
