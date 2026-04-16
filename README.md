# BuildSight — AI Assembly Guide Platform

Real-time AI-powered assembly guidance. Point your camera, get step-by-step instructions.

## Stack
- **Next.js 14** (App Router) — frontend + backend API
- **Neon PostgreSQL** + Drizzle ORM — database
- **NextAuth v5** — Google & GitHub OAuth
- **Ollama** (local dev) / **Gemini Flash** (production) — AI vision

## Quick Start

```bash
# 1. Install
npm install

# 2. Setup env
cp .env.example .env.local
# Fill in DATABASE_URL, NEXTAUTH_SECRET, OAuth credentials

# 3. Pull Ollama model (dev only)
ollama pull llava

# 4. Run DB migrations
npm run db:push

# 5. Seed demo projects
npm run db:seed

# 6. Start (in separate terminals)
ollama serve
npm run dev
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/analyse` | Required | Send camera frame → AI step guidance |
| GET | `/api/projects` | Public | List projects (paginated, filterable) |
| GET | `/api/projects/:id` | Public | Get project with all steps |
| POST | `/api/projects` | Admin | Create project |
| PUT | `/api/projects/:id` | Admin | Update project |
| GET | `/api/sessions` | Required | User's sessions |
| POST | `/api/sessions` | Required | Start new session |
| GET | `/api/sessions/:id` | Required | Get session + progress |
| PATCH | `/api/sessions/:id` | Required | Update step progress |
| DELETE | `/api/sessions/:id` | Required | Delete session |
| GET | `/api/users/me` | Required | Current user profile |
| DELETE | `/api/users/me` | Required | GDPR delete account |

## AI Provider Switching

```env
AI_PROVIDER=ollama    # Development — free, local
AI_PROVIDER=gemini    # Production — pay per use (~$0.0002/image)
```

## Security Features
- JWT sessions (httpOnly cookie)
- Rate limiting: 20 AI req/min, 60 API req/min per user
- Zod input validation on all endpoints
- Image size limit (2MB max)
- Security headers (CSP, X-Frame-Options, Permissions-Policy)
- Camera frames never stored — processed in memory only
- GDPR delete endpoint

## Environment Variables
See `.env.example` for full list.

