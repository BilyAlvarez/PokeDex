# Pokédex Real

Aplicación web Pokédex con reconocimiento de imagen por IA, diseño de dispositivo GBA clásico modernizado, y asistente conversacional integrado.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite + TypeScript |
| Estilizado | Tailwind CSS + CSS Modules |
| Animaciones | Framer Motion |
| Estado | Zustand |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Base de datos | PostgreSQL |
| Cache | Redis (preparado) |
| IA Visión | Modelo fine-tuned (mock incluido) |
| IA Asistente | Claude API |

## Estructura

```
pokedex/
├── packages/
│   ├── backend/          # API REST Express + Prisma
│   │   ├── src/
│   │   │   ├── api/      # Rutas y middleware
│   │   │   ├── services/ # Lógica de negocio
│   │   │   ├── integrations/ # PokéAPI, Claude, Vision AI
│   │   │   └── config/   # Configuración
│   │   └── prisma/       # Schema de base de datos
│   └── frontend/         # React + Vite
│       └── src/
│           ├── components/  # UI, Device, Camera, Pokédex, Search, Assistant, Auth
│           ├── hooks/       # Custom hooks
│           ├── stores/      # Zustand stores
│           ├── pages/       # Rutas de la app
│           └── services/    # API client, Camera, TTS
└── package.json          # Monorepo root
```

## Requisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp packages/backend/.env.example packages/backend/.env
# Editar .env con tu conexión PostgreSQL

# Inicializar base de datos
cd packages/backend
npx prisma db push

# Iniciar en desarrollo
cd ../..
npm run dev
```

## Desarrollo

```bash
# Iniciar backend y frontend simultáneamente
npm run dev

# Solo backend (puerto 3000)
npm run dev:backend

# Solo frontend (puerto 5173)
npm run dev:frontend
```

## API Endpoints

```
GET    /api/v1/health
GET    /api/v1/pokemon           - Lista paginada
GET    /api/v1/pokemon/:id       - Ficha completa
GET    /api/v1/pokemon/:id/evolutions
GET    /api/v1/pokemon/:id/moves
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/scan              - Reconocimiento IA
GET    /api/v1/user/progress
PUT    /api/v1/user/progress
POST   /api/v1/assistant/chat
POST   /api/v1/assistant/narrate
```

## Licencia

MIT
