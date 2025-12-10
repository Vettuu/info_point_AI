## Modalità vocale – panoramica

L’assistente Info Point AI è stato esteso con una pipeline voce → voce che mantiene il motore testuale esistente e aggiunge lo strato audio. In sintesi:

1. **Frontend (Next.js)**  
   - Il componente `InfoPointPage` offre un bottone “Parla/Stop”.  
   - Usa `MediaRecorder` per acquisire audio `webm` dal microfono, mostra feedback (“Sto ascoltando…”, “Sto elaborando…”, “Risposta pronta”) e invia il blob via `FormData` all’endpoint vocale (`NEXT_PUBLIC_VOICE_API`).  
   - Quando riceve la risposta, aggiorna la chat (come per l’input testuale) e riproduce l’audio base64 restituito dal backend. Se l’audio non è presente o fallisce, l’utente legge comunque il testo.

2. **Backend (Laravel)**  
   - L’API `POST /api/voice-assistant` (controller `VoiceAssistantController`) accetta un file audio (`mimetypes: audio/webm, video/webm, audio/wav, audio/mpeg, audio/mp4, audio/ogg, audio/x-m4a`).  
   - L’audio viene salvato temporaneamente (filesystem `storage/app/private/voice-inputs`) e passa attraverso tre servizi:
     - `SpeechToTextService`: chiama OpenAI **STT** (`gpt-4o-mini-transcribe`, response_format `json`) e restituisce la trascrizione in italiano.
     - `InfoPointAssistant`: riutilizza il vector store locale (`storage/app/knowledge_index.json`) per fornire contesto al modello **LLM** `gpt-4o-mini`. L’output contiene testo + fonti.
     - `TextToSpeechService`: tenta di generare l’audio con OpenAI **TTS** (`gpt-4o-mini-tts`, voce `alloy`). Se fallisce, viene loggato ma la risposta testuale non si perde.
   - L’endpoint restituisce JSON strutturato (`question`, `answer`, `audio` base64, `sources`). Gli errori vengono gestiti con messaggi espliciti e logging in `storage/logs/laravel.log`.

3. **Conoscenza locale**  
   - La knowledge (programmi, piantine, FAQ) continua a vivere in `resources/knowledge`. Per aggiornare l’indice vettoriale basta:  
     ```bash
     cd backend
     php artisan app:build-knowledge-index
     ```

## Modelli OpenAI utilizzati

| Funzione | Modello | Note |
| --- | --- | --- |
| Trascrizione (STT) | `gpt-4o-mini-transcribe` | `response_format: json`, `language: it` |
| Ragionamento testuale | `gpt-4o-mini` | Stesso modello dell’MVP, con prompt + documenti dal knowledge store |
| Sintesi vocale (TTS) | `gpt-4o-mini-tts` | Voce `alloy`, formato audio default (mp3) |

## Configurazione & variabili

- **Backend `.env`**  
  ```
  OPENAI_STT_MODEL=gpt-4o-mini-transcribe
  OPENAI_TTS_MODEL=gpt-4o-mini-tts
  OPENAI_TTS_VOICE=alloy
  OPENAI_STT_LANGUAGE=it
  ```
  Più i limiti di upload (se necessario): `UPLOAD_MAX_FILESIZE`, `POST_MAX_SIZE`, `MAX_INPUT_TIME`, `MAX_EXECUTION_TIME`, `MEMORY_LIMIT`.

- **Frontend `.env.local`**  
  ```
  NEXT_PUBLIC_ASSISTANT_API=http://127.0.0.1:8000/api/assistant
  NEXT_PUBLIC_VOICE_API=http://127.0.0.1:8000/api/voice-assistant
  NEXT_PUBLIC_AGENDA_URL=http://127.0.0.1:8000/docs/agenda
  NEXT_PUBLIC_MAP_URL=http://127.0.0.1:8000/docs/piantina
  ```

- **CTA PDF**  
  Le rotte `/docs/agenda` e `/docs/piantina` servono i PDF dal knowledge locale. I pulsanti “Consulta l’agenda” e “Visualizza piantina” li aprono in nuova scheda.

## Flusso completo – step-by-step

1. **Utente parla** → `MediaRecorder` crea `Blob` → invio a `/api/voice-assistant`.
2. **`SpeechToTextService`** → `audio.transcribe` → testo (IT).
3. **`InfoPointAssistant`** → recupera contesto dal knowledge index → `gpt-4o-mini` → risposta + fonti.
4. **`TextToSpeechService`** → `audio.speech` → audio base64 (se disponibile).
5. **Frontend** → mostra domanda/risposta in chat, allega fonti, riproduce audio.

## Troubleshooting rapido

- **Errore `The audio failed to upload`** → controlla `upload_max_filesize` / `post_max_size` del server PHP e assicurati che il file sia in uno dei formati accettati (anche `video/webm` è permesso).
- **Errore STT “verbose_json non compatibile”** → usare `response_format: json` come fatto in `SpeechToTextService`.
- **CORS** → `config/cors.php` include `http://localhost:3000`. In produzione aggiungi il dominio reale.
- **Log** → `storage/logs/laravel.log` registra ogni richiesta vocale e gli eventuali errori STT/TTS.

Con questa architettura la modalità vocale rimane un layer opzionale: se l’audio o il TTS falliscono, il flusso testuale continua a funzionare identico all’MVP. Gradi ulteriori (nuove voci, lingue o modelli) richiedono solo di aggiornare le variabili in `.env` e i servizi dedicati.  

## Esecuzione & deploy

- **Avvio locale**  
  - Backend: `cd backend && ./start_octane.sh --watch` (Octane + Swoole sulla porta 8000 con limiti PHP forzati).  
  - Frontend: `cd frontend && npm run dev`.  
  - WebSocket: `NEXT_PUBLIC_VOICE_WS=ws://127.0.0.1:8000/ws/voice-assistant`.

- **Aggiornamento knowledge**  
  - `php artisan app:build-knowledge-index` ogni volta che viene modificato qualcosa in `resources/knowledge`.

- **CORS / domini**  
  - Variabile `FRONTEND_ORIGINS` (es. `https://totem.evento.it,https://backup.evento.it`). Il backend accetta solo le origini presenti.

- **Log e monitoraggio**  
  - Backend: `tail -f backend/storage/logs/laravel.log`. Qui trovi info su STT/TTS, errori di pipeline e sessioni WS.  
  - Frontend: console browser per eventuali errori WebSocket/MediaRecorder.

- **Produzione**  
  - Usa `./start_octane.sh` (senza `--watch`) dietro reverse proxy.  
  - Mantieni attivi processi separati per build frontend (`npm run build && npm run start`) e per generazione knowledge.  
  - Configura supervisione (systemd, pm2 o simili) per riavviare Octane e Next in caso di crash.
