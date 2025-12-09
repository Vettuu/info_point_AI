/infopoint_ai
│
├── /frontend               # Frontend (Next.js)
│   ├── /public             # Asset pubblici (immagini, favicon, ecc.)
│   ├── /src
│   │   ├── /components     # Componente React
│   │   │   ├── Chat        # Componente per la chat
│   │   │   ├── Assistant   # Componente per l'assistente virtuale (voce + volto)
│   │   │   ├── Navbar      # Barra di navigazione
│   │   │   ├── Footer      # Footer generico
│   │   ├── /pages          # Pagine Next.js (routing e rendering)
│   │   │   ├── index.js    # Pagina principale
│   │   │   ├── chat.js     # Pagina chat
│   │   │   ├── about.js    # Informazioni sul congresso
│   │   ├── /styles         # Stili globali (CSS/SCSS)
│   │   ├── /utils          # Funzioni di utilità (helper, formati di data, ecc.)
│   │   ├── /hooks          # Hook personalizzati React
│   │   ├── /services       # Funzioni per interazione con API (OpenAI, server backend)
│   ├── next.config.js      # Configurazione Next.js
│   └── package.json        # Gestione delle dipendenze frontend
│
├── /backend                # Backend (Laravel)
│   ├── /app                # Logica applicativa
│   │   ├── /Console        # Comandi personalizzati Artisan
│   │   ├── /Exceptions     # Gestione errori e eccezioni
│   │   ├── /Http           # Gestione delle richieste HTTP
│   │   │   ├── /Controllers  # Controller per gestire le rotte
│   │   │   ├── /Middleware   # Middleware per autenticazione, validazione
│   │   │   ├── /Requests     # Request personalizzati per validazione dati
│   │   ├── /Models         # Modelli Eloquent per interagire con il database
│   │   ├── /Notifications  # Gestione notifiche (email, sistemi di alert)
│   ├── /config             # Configurazione delle API, database, ecc.
│   ├── /database           # Migrazioni e seeder
│   │   ├── /migrations     # Migrazioni per il DB
│   │   ├── /seeds          # Seeder per il database
│   ├── /routes             # Definizione delle rotte API (RESTful)
│   │   ├── api.php         # File di routing delle API
│   ├── /resources          # Risorse per la generazione di risposte (views, JSON)
│   │   ├── /lang           # Traduzioni del sistema
│   ├── /storage            # File storage (log, file temporanei, ecc.)
│   ├── /tests              # Test automatizzati (unit, feature, ecc.)
│   ├── .env                # Variabili di ambiente (chiavi API, DB, ecc.)
│   ├── artisan             # CLI di Laravel
│   ├── composer.json       # Gestione delle dipendenze backend
│   └── package.json        # Gestione dipendenze (per task npm, mix, ecc.)
│
├── /docs                   # Documentazione del progetto
│   ├── /architecture.md    # Dettagli sull'architettura del sistema
│   ├── /api-docs.md        # Documentazione delle API
│   ├── /user-guide.md      # Guida per gli utenti finali
│   └── /developer-guide.md # Guida per gli sviluppatori
│
├── /scripts                # Script per automazioni (CI/CD, deploy, ecc.)
│   ├── deploy.sh           # Script di deploy automatizzato
│   └── test.sh             # Script di test automatizzati
│
├── /logs                   # Log di sistema (può essere esternalizzato)
│
└── README.md               # Descrizione generale del progetto
