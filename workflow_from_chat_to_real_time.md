## Workflow – conversione da chatbot “push-to-talk” a conversazione vocale realtime

### Step 1 – Installazione e prerequisiti
1. **Backend**
   - Installa Laravel Octane con Swoole (oppure un server WebSocket equivalente):
     ```bash
     composer require laravel/octane
     php artisan octane:install
     ```
   - Configura `php.ini` o variabili `upload_max_filesize`, `post_max_size`, `memory_limit`.
2. **Frontend**
   - Verifica che il browser supporti MediaRecorder e WebSocket (Chrome, Edge, Safari ≥ 14.1).

#### Step 1 – Esecuzione pratica (dev + future deploy)
1. **Prerequisiti di sistema**
   - Assicurati di avere accesso root per installare pacchetti APT.
   - Aggiorna gli indici: `sudo apt-get update`.
   - Installa i tool di sviluppo PHP8.4 e PECL:
     ```bash
     sudo apt-get install -y php8.4-dev php8.4-xml php-pear build-essential
     ```
   - Installa le dipendenze native richieste da Swoole (solo ciò che serve):
     ```bash
     sudo apt-get install -y libcurl4-openssl-dev
     ```
2. **Installazione estensione Swoole via PECL**
   - Lancia `sudo pecl install swoole`.
   - Rispondi ai prompt nel seguente modo per il nostro stack:
     ```
     enable sockets support? [no] : yes
     enable openssl support? [no] : yes
     enable mysqlnd support? [no] : no
     enable curl support? [no] : yes
     enable cares/brotli/zstd/PostgreSQL/ODBC/Oracle/Sqlite/thread/iouring ... : no
     ```
   - Al termine verifica: `php -m | grep swoole` deve restituire `swoole`.
   - Abilita l’estensione creando il file di configurazione:
     ```bash
     echo "extension=swoole.so" | sudo tee /etc/php/8.4/cli/conf.d/30-swoole.ini
     ```
3. **Octane + Swoole**
   - Nel progetto backend (`cd ~/infopoint_ai/backend`):
     - Controlla che `composer.json` contenga `laravel/octane` e che il comando `php artisan octane:install` sia stato eseguito (lo è già, ma in un setup nuovo va rieseguito).
     - Per sviluppare usa: `php artisan octane:start --server=swoole --watch`.
     - Per un ambiente server (senza watch): `php artisan octane:start --server=swoole --host=0.0.0.0 --port=8000`.
4. **Limiti PHP**
   - Se necessario, modifica `/etc/php/8.4/cli/php.ini` aggiungendo/le righe:
     ```
     upload_max_filesize = 20M
     post_max_size = 20M
     memory_limit = 512M
     max_execution_time = 120
     max_input_time = 120
     ```
   - Riavvia il terminale o il server PHP per applicare i limiti oppure esporta temporaneamente:
     ```bash
     export UPLOAD_MAX_FILESIZE=20M
     export POST_MAX_SIZE=20M
     export MEMORY_LIMIT=512M
     export MAX_EXECUTION_TIME=120
     export MAX_INPUT_TIME=120
     ```
   - Verifica con `php -i | grep upload_max_filesize`.
5. **Frontend**
   - Nessuna installazione extra: basta confermare il supporto browser (Chrome/Edge/Safari ≥ 14.1).

### Step 2 – Configurazione servizi OpenAI
1. Aggiorna `.env`:
   ```
   OPENAI_API_KEY=...
   OPENAI_MODEL=gpt-4o-mini
   OPENAI_STT_MODEL=gpt-4o-mini-transcribe
   OPENAI_TTS_MODEL=gpt-4o-mini-tts
   OPENAI_TTS_VOICE=alloy
   OPENAI_STT_LANGUAGE=it
   ```
2. In `config/openai.php` aggiungi sezione `voice`.

#### Step 2 – Esecuzione pratica
1. **Variabili ambiente**
   - Modifica `backend/.env` sostituendo `OPENAI_MODEL` con `gpt-4o-mini` e assicurandoti che `OPENAI_STT_MODEL`, `OPENAI_TTS_MODEL`, `OPENAI_TTS_VOICE`, `OPENAI_STT_LANGUAGE` siano valorizzati come da blocco sopra.
   - Aggiorna anche `backend/.env.example` per mantenere allineati gli esempi.
2. **Configurazione applicativa**
   - In `config/openai.php` imposta il default del campo `'model'` a `gpt-4o-mini`.
   - Verifica che la sezione `voice` contenga le chiavi `stt_model`, `tts_model`, `voice`, `language` collegati alle rispettive variabili `.env`.
3. **Check**
   - Esegui `php artisan config:clear` se il server è avviato per rileggere i nuovi valori.
   - Test rapido: `php artisan tinker` e `config('openai.model')` devono restituire `gpt-4o-mini`.

### Step 3 – Session manager e WebSocket backend
1. Crea `SessionManager` che genera un `sessionId` e memorizza:
   ```php
   class VoiceSession {
       public string $id;
       public bool $assistantSpeaking = false;
       public SplQueue $audioChunks = new SplQueue();
       public ?WhisperStream $liveSttStream = null;
       public ?string $currentTranscript = null;
   }
   ```
2. Registra rotta Octane:
   ```php
   Octane::route('GET', '/ws/voice-assistant', VoiceAssistantWebSocket::class);
   ```

#### Step 3 – Esecuzione pratica
1. **Struttura Voice**
   - Nuovo namespace `App\Voice` con:
     - `VoiceSession`: incapsula stato conversazione (`assistantSpeaking`, `audioChunks`, `currentTranscript`) e metodo `reset`.
     - `SessionManager`: registra/recupera sessioni (`create`, `get`, `reset`, `forget`), usa UUID come identificativo.
     - `VoiceAssistantWebSocket`: per ora placeholder che crea una sessione e restituisce `501` finché lo streaming non è pronto.
2. **Registrazione container**
   - In `AppServiceProvider::register` aggiungi `singleton(SessionManager::class, fn () => new SessionManager())`.
3. **Routing Octane**
   - In `AppServiceProvider::boot` aggiungi:
     ```php
     if (class_exists(\Laravel\Octane\Facades\Octane::class)) {
         Octane::route('GET', '/ws/voice-assistant', function (Request $request) {
             return app(VoiceAssistantWebSocket::class)($request);
         });
     }
     ```
     Questo consente di eseguire l’handler tramite il container Laravel fino all’implementazione WebSocket completa.

### Step 4 – Gestore WebSocket
`VoiceAssistantWebSocket`:
```php
$connection->send(json_encode(['type' => 'session_started', 'sessionId' => ...]));
$connection->onMessage(function ($message) {
    switch ($message['type']) {
        case 'audio_chunk': VoicePipelineService->handleChunk(...); break;
        case 'user_stop': VoicePipelineService->flushUserInput(...); break;
        case 'user_cancel': SessionManager->reset(...); break;
    }
});
$connection->onClose(fn () => SessionManager->destroy(...));
```

#### Step 4 – Esecuzione pratica
1. **VoicePipelineService**
   - Nuova classe `App\Voice\VoicePipelineService` con dipendenze `SpeechToTextService`, `TextToSpeechService`, `InfoPointAssistant`.
   - Metodi placeholder:
     - `handleAudioChunk(VoiceSession $session, string $chunkBase64)`
     - `handleUserStop(VoiceSession $session)`
     - `handleUserCancel(VoiceSession $session)`
   - Al momento esegue logging e gestisce reset sessione; Step 5 collegherà STT/LLM/TTS.
2. **VoiceAssistantWebSocket**
   - Ora riceve `SessionManager` + `VoicePipelineService`.
   - Espone metodi `handleOpen`, `handleMessage`, `handleClose` per futura integrazione WebSocket pura.
   - In attesa del trasporto WS, supporta richieste HTTP POST verso `/ws/voice-assistant`:
     ```json
     { "sessionId": "...", "type": "audio_chunk", "data": "base64..." }
     ```
     per testare i percorsi `audio_chunk`, `user_stop`, `user_cancel`.
   - La richiesta GET continua a creare una sessione e restituisce 501 per segnalare che bisogna usare WebSocket (o la POST provvisoria).
3. **Routing**
   - `AppServiceProvider::boot` registra sia GET che POST tramite `Octane::route`.

### Step 5 – Pipeline realtime STT→LLM→TTS
1. **handleChunk**
   ```php
   $session->audioChunks->enqueue($chunk);
   if (!$session->liveSttStream) {
       $session->liveSttStream = openSttStream($session);
   }
   $session->liveSttStream->append($chunk);
   ```
2. **openSttStream** (Whisper streaming)
   - `onTranscript` → evento `transcript` con testo parziale.
   - `onFinal` → chiama `handleAssistantResponse`.
3. **handleAssistantResponse**
   - Se `assistantSpeaking`, invia `assistant_paused`, interrompe TTS corrente.
   - Usa `InfoPointAssistant->answer($text)` per ottenere risposta + fonti.
   - Invia `assistant_text`.
   - Avvia `streamTTS`.
4. **streamTTS**
   - `audio()->speechStreamed([...])`.
   - Per ogni chunk -> `assistant_audio_chunk`.
   - Al termine -> `assistant_audio_end`.
5. **Fallback**: se STT/TTS fallisce, invia `type: error` e prosegui con testo.

#### Step 5 – Esecuzione pratica
1. **Accodamento chunk**
   - `VoicePipelineService::handleAudioChunk` ora scarta chunk vuoti, li accoda nello `SplQueue` della sessione e scrive su log il numero di elementi.
2. **Flush + STT**
   - `handleUserStop` richiama `flushChunksToFile` che:
     - crea `storage/app/voice-inputs`;
     - scrive i chunk concatenati in un file `.webm`.
   - Il file viene inviato al servizio `SpeechToTextService::transcribe`, quindi rimosso.
3. **LLM + TTS**
   - La trascrizione viene salvata in `$session->currentTranscript`.
   - `InfoPointAssistant->answer($transcript)` restituisce testo e fonti.
   - Si tenta la sintesi vocale (`TextToSpeechService->synthesize`). In caso d’errore il log registra il problema ma il testo viene comunque restituito.
   - La coda chunk viene svuotata per la prossima richiesta.
4. **HTTP fallback temporaneo**
   - `VoiceAssistantWebSocket::__invoke` accetta ora `POST /ws/voice-assistant` con:
     - `type=audio_chunk` → accoda e risponde `status: chunk_stored`;
     - `type=user_stop` → ritorna `question`, `answer`, `audio` (base64 MP3) e `sources`;
     - `type=user_cancel` → reset sessione.
   - Questo permette di testare la pipeline STT→LLM→TTS prima dell’integrazione WebSocket reale.

### Step 6 – Frontend WebSocket + Recorder
1. Hook `useVoiceAssistant`:
   ```ts
   const ws = new WebSocket(process.env.NEXT_PUBLIC_VOICE_WS!);
   ws.onmessage = (event) => {
       switch (msg.type) {
           case 'session_started': setSessionId(msg.sessionId); break;
           case 'transcript': updatePartial(msg.text); break;
           case 'assistant_text': appendChat(msg.answer); break;
           case 'assistant_audio_chunk': audioStreamer.enqueue(msg.data); break;
           case 'assistant_audio_end': audioStreamer.flush(); setStatus('idle'); break;
           case 'assistant_paused': audioStreamer.pause(); break;
       }
   };
   ```
2. `sendAudioChunk`: converte `ArrayBuffer` in base64 e invia `{"type":"audio_chunk","data":...}`.
3. `MediaRecorder`:
   ```ts
   recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
   recorder.ondataavailable = (evt) => evt.data.arrayBuffer().then(sendAudioChunk);
   recorder.start(200);
   ```

#### Step 6 – Esecuzione pratica
1. **Configurazione**
   - Aggiunta la variabile `NEXT_PUBLIC_VOICE_WS` in `frontend/.env.local.example` puntando a `ws://127.0.0.1:8000/ws/voice-assistant`.
2. **Gestione WebSocket**
   - `frontend/src/pages/index.js` apre la connessione quando l’assistente viene attivato. Se la connessione fallisce, imposta automaticamente il trasporto su `http`.
   - Gestione eventi `session_started`, `transcript`, `assistant_text`, `assistant_audio_chunk`, `assistant_audio_end`, `assistant_paused`, `error` con fallback su logica preesistente (chat history + riproduzione audio).
   - Introduzione di helper (`bufferToBase64`, `base64ToUint8Array`, `playWsAudio`, `sendWsPayload`) per serializzare chunk e riprodurre la risposta.
3. **Recorder & stato UI**
   - Il bottone vocale ora supporta due modalità:
     - `ws`: registra con slice da 250 ms e invia ogni chunk in tempo reale (`sendAudioChunkViaWs`); allo stop invia `user_stop`.
     - `http`: si comporta come prima concatenando i chunk e inviando un singolo blob al controller REST.
   - Stati principali gestiti da `voicePhase` (`idle`, `listening`, `processing`, `speaking`) con messaggi dinamici mostrati sotto l’input.
   - Rimane il supporto a `isVoiceProcessing` per disabilitare l’interfaccia durante l’elaborazione; eventuali errori ricadono sul flusso HTTP tradizionale.

### Step 7 – Audio playback e stati UI
1. `AudioStreamer` (AudioContext):
   - `enqueue(chunkBase64)`, `play()`, `pause()`, `flush()`.
2. Stati UI:
   - `idle`, `listening`, `processing`, `speaking`.
   - Feedback “Sto ascoltando…”, “Sto rispondendo…”.
3. Se l’utente parla durante la TTS → invia `user_stop`, il backend mette in pausa e riprende ad ascoltare.

#### Step 7 – Esecuzione pratica
1. **AudioStreamer**
   - Implementata una classe client-side (`frontend/src/pages/index.js`) che gestisce una coda di chunk base64.
   - Metodi chiave:
     - `enqueue` converte e riproduce in sequenza ogni chunk.
     - `markStreamComplete(cb)` richiama `cb` quando la coda si svuota.
     - `flush` interrompe la riproduzione e ripulisce la coda (usato quando l’utente interrompe la risposta).
2. **Integrazione WS/HTTP**
   - Gli eventi `assistant_audio_chunk` alimentano immediatamente `AudioStreamer`, mentre `assistant_audio_end` invoca `markStreamComplete` per aggiornare lo stato a `idle`.
   - Nel fallback HTTP, l’audio restituito viene inserito come singolo chunk e riprodotto con lo stesso streamer, mantenendo comportamenti coerenti.
3. **Gestione stati**
   - Introdotto `voicePhase` con i valori `idle | listening | processing | speaking` e messaggi dinamici (via `VOICE_STATUS_LABELS`).
   - Quando l’utente avvia una nuova registrazione mentre il bot sta parlando, l’audio viene stoppato (`flush`) e viene inviato un segnale di reset (`user_cancel`) per preparare una nuova domanda.

### Step 8 – Ottimizzazioni
1. Riduci latenza:
   - chunk da 200 ms.
   - `max_tokens` ridotto per gpt-4o-mini.
   - Mantieni coda audio breve (drop chunk se >2s).
2. sessionId → includi in ogni messaggio per supportare più utenti contemporanei.

#### Step 8 – Esecuzione pratica
1. **Riduzione chunk recorder**
   - `MediaRecorder.start` ora usa `200ms` come slice quando si è in modalità WS (`frontend/src/pages/index.js`), garantendo una latenza più bassa.
2. **Coda backend limitata**
   - `VoicePipelineService::handleAudioChunk` mantiene al massimo 10 chunk (≈2 secondi). Quando la coda supera la soglia, i chunk più vecchi vengono rimossi con log dedicato.
3. **Limite output LLM**
   - Nuova variabile `OPENAI_MAX_OUTPUT_TOKENS` in `.env/.env.example`.
   - `config/openai.php` espone `max_output_tokens`, e `InfoPointAssistant` la sfrutta aggiungendo `max_output_tokens` alle chiamate `responses()->create`.
4. **Consistenza sessionId**
   - Il fallback HTTP rimane separato, ma il trasporto WebSocket include automaticamente `sessionId` in ogni `sendWsPayload` grazie a `voiceSessionId`; l’avvio della registrazione in streaming è consentito solo se `voiceSessionId` è presente.

### Step 9 – Fallback & error handling
1. STT fallisce → `type: error_stt`, mostra “Non riesco a sentirti, riprova”.
2. TTS fallisce → `assistant_text` + `assistant_audio_error`, il frontend mostra solo testo.
3. Log in `storage/logs/laravel.log` per debug.

#### Step 9 – Esecuzione pratica
1. **Eccezioni dedicate**
   - Creata `App\Voice\Exceptions\VoicePipelineException` per distinguere gli errori lato pipeline (`audio_missing`, `stt_failed`, `assistant_failed`, ecc.).
   - `VoicePipelineService::handleUserStop` ora lancia questa eccezione in caso di audio assente o problemi di trascrizione/LLM, così il chiamante può restituire messaggi chiari.
2. **HTTP fallback robusto**
   - `VoiceAssistantWebSocket` avvolge la gestione dei messaggi in un blocco `try/catch`:
     - intercetta `VoicePipelineException` e risponde con `status: error`, `type`, `message` e codice 422;
     - per errori inattesi logga l’eccezione e restituisce 500 con messaggio generico.
3. **Logging**
   - Gli errori recuperabili vengono loggati con livello `warning`, quelli non gestiti con `error`, così `storage/logs/laravel.log` mostra il punto esatto del guasto.
4. **Comportamento UI**
   - Il frontend sfrutta già `setError` e `voiceStatus`: quando riceve `status: error`, mostra il messaggio restituito e torna allo stato `idle`, mantenendo la chat reattiva anche dopo un problema momentaneo.

### Step 10 – Deployment
1. Assicurati che Swoole/Octane giri dietro Nginx/Apache (reverse proxy).
2. Imposta CORS includendo il dominio reale (frontend).
3. Monitora memoria e CPU (streaming audio può essere intenso).
4. Aggiorna la documentazione (`funzionamento_vocale.md`) con il nuovo flusso realtime.

#### Step 10 – Esecuzione pratica
1. **Script di avvio**  
   - Creato `backend/start_octane.sh`: applica i limiti PHP tramite variabili (`UPLOAD_MAX_FILESIZE`, `POST_MAX_SIZE`, ecc.) e lancia `php artisan octane:start --server=swoole --host=0.0.0.0 --port=8000`. Usalo in dev con `--watch` e in produzione senza flag extra.
   - Nuovo comando `php artisan voice:ws-server --host=127.0.0.1 --port=9000` che avvia il server WebSocket dedicato alla modalità realtime (usa Swoole puro).
2. **CORS configurabile**  
   - Nuova variabile `FRONTEND_ORIGINS` in `.env/.env.example`.  
   - `config/cors.php` ora legge l’elenco separato da virgole e include anche il percorso `ws/*` per le WebSocket.
3. **Documentazione aggiornata**  
   - `README.md` spiega requisiti, setup di backend/frontend, variabili ambiente e come avviare Octane/Next.  
   - `funzionamento_vocale.md` contiene la sezione “Esecuzione & deploy” con riferimenti a `start_octane.sh`, aggiornamento knowledge e logging.
4. **Checklist produzione**  
   - Reverse proxy verso `127.0.0.1:8000` per `/api`, `/docs`, `/ws`.  
   - `FRONTEND_ORIGINS` impostato sul dominio reale del totem.  
   - `tail -f backend/storage/logs/laravel.log` per monitorare pipeline STT/TTS.  
   - Knowledge aggiornata con `php artisan app:build-knowledge-index` durante gli update di contenuto.
