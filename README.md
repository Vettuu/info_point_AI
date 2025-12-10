## Info Point AI – guida rapida

Questo repository contiene:

- **frontend/** – interfaccia Next.js per il totem Info Point AI.
- **backend/** – API Laravel 12 con Octane + Swoole per chat e modalità vocale.
- **backend/resources/knowledge/** – documenti sorgente (agenda, FAQ, piantina) utilizzati dalla knowledge base locale.

### Requisiti principali

- Node.js 18+ (per il frontend Next.js).
- PHP 8.4 con estensione **Swoole** (già installata nell’ambiente di sviluppo).
- Composer, npm.

### Setup iniziale

```bash
# Backend
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --force   # se usi DB diversi da sqlite

# Frontend
cd ../frontend
cp .env.local.example .env.local
npm install
```

Ogni volta che aggiorni i file della knowledge base esegui:

```bash
cd backend
php artisan app:build-knowledge-index
```

### Avvio in sviluppo

Terminale 1 – backend Octane con Swoole:

```bash
cd backend
./start_octane.sh --watch
```

Terminale 2 – frontend Next.js:

```bash
cd frontend
npm run dev
```

Il frontend sarà disponibile su `http://localhost:3000`, il backend su `http://127.0.0.1:8000`.

### Variabili d’ambiente importanti

Backend (`backend/.env`):

- `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_STT_MODEL`, `OPENAI_TTS_MODEL`, `OPENAI_TTS_VOICE`, `OPENAI_STT_LANGUAGE`
- `OPENAI_MAX_OUTPUT_TOKENS` (limita la lunghezza delle risposte)
- `FRONTEND_ORIGINS` (domini autorizzati via CORS)
- Limiti PHP: `UPLOAD_MAX_FILESIZE`, `POST_MAX_SIZE`, `MAX_INPUT_TIME`, `MAX_EXECUTION_TIME`, `MEMORY_LIMIT`

Frontend (`frontend/.env.local`):

- `NEXT_PUBLIC_ASSISTANT_API`, `NEXT_PUBLIC_VOICE_API`, `NEXT_PUBLIC_VOICE_WS`
- `NEXT_PUBLIC_AGENDA_URL`, `NEXT_PUBLIC_MAP_URL`

### Deploy / produzione

1. Imposta `FRONTEND_ORIGINS` con il dominio reale (es. `https://infopoint.example.com`).
2. Avvia il backend con `./start_octane.sh` dietro un reverse proxy (Nginx/Apache) che inoltri:
   - `/api/*` → `http://127.0.0.1:8000`
   - `/ws/*` → `http://127.0.0.1:8000` (WebSocket)
   - `/docs/*` → `http://127.0.0.1:8000`
3. Serve il frontend Next.js statico (build `npm run build && npm run start`) o tramite Vercel.
4. Monitora `storage/logs/laravel.log` per le richieste vocali e `npm run build` per eventuali errori UI.

Consulta `workflow_from_chat_to_real_time.md` per il percorso dettagliato verso la modalità realtime e `funzionamento_vocale.md` per l’architettura completa della pipeline vocale.
