# angular-nestjs-fullstack-starter

Angular + NestJS + PostgreSQL starter with **feature-driven** layout. Docker config lives under `docker/`; add domain features as you build the app.

## Folder structure

```
angular-nestjs-fullstack-starter/
├── docker/
│   ├── docker-compose.yml             # App services + PostgreSQL
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── nginx.conf
├── frontend/                          # Angular
│   └── src/
│       ├── app/
│       │   ├── core/                  # Singletons: guards, interceptors, API client
│       │   │   ├── auth.guard.ts
│       │   │   ├── auth.interceptor.ts
│       │   │   └── api.service.ts
│       │   ├── shared/                # Reusable UI, pipes, directives, models
│       │   │   ├── components/
│       │   │   ├── pipes/
│       │   │   └── models/
│       │   ├── features/              # One folder per feature (lazy-loaded routes)
│       │   │   ├── auth/              # included in starter
│       │   │   │   ├── login/
│       │   │   │   ├── register/
│       │   │   │   ├── auth.service.ts
│       │   │   │   └── auth.routes.ts
│       │   │   └── <feature-name>/
│       │   │       ├── components/
│       │   │       ├── <feature-name>.service.ts
│       │   │       ├── <feature-name>.routes.ts
│       │   │       └── ...
│       │   ├── app.config.ts
│       │   └── app.routes.ts
│       └── environments/
│           ├── environment.ts
│           └── environment.prod.ts
├── backend/                           # NestJS
│   └── src/
│       ├── common/                    # Decorators, filters, guards, interceptors, shared DTOs
│       ├── config/                    # App + database (PostgreSQL) configuration
│       ├── modules/                   # One Nest module per feature
│       │   ├── auth/                  # included in starter
│       │   │   ├── auth.module.ts
│       │   │   ├── auth.controller.ts     # /register, /login, /refresh, /logout
│       │   │   ├── auth.service.ts        # business logic
│       │   │   ├── strategies/
│       │   │   │   └── jwt.strategy.ts            # validates access token
│       │   │   └── dto/
│       │   │       ├── register.dto.ts
│       │   │       ├── login.dto.ts
│       │   │       └── token-response.dto.ts
│       │   └── <feature-name>/
│       │       ├── <feature-name>.module.ts
│       │       ├── <feature-name>.controller.ts
│       │       ├── <feature-name>.service.ts
│       │       ├── entities/
│       │       └── dto/
│       ├── prisma/                    # Prisma schema + PostgreSQL migrations
│       ├── app.module.ts
│       └── main.ts
├── .env.example                       # DATABASE_URL, ports, secrets
└── README.md
```

### Feature-driven layout

| Layer | Role |
|-------|------|
| `frontend/src/app/features/auth/` | Login, register, and `auth.service` (tokens, session) |
| `backend/src/modules/auth/` | JWT auth: register, login, refresh, logout |
| `frontend/src/app/features/<feature-name>/` | Additional features — same pattern as `auth/` |
| `backend/src/modules/<feature-name>/` | Additional features — same pattern as `auth/` |
| `frontend/src/app/core/` + `shared/` | Cross-cutting Angular code (not tied to one feature) |
| `backend/src/common/` + `config/` | Cross-cutting NestJS code and PostgreSQL setup |

Auth ships with the starter. Add more features by creating matching folders on both sides and wiring routes / `AppModule` imports.

## Auth setup

Email/password authentication is included out of the box with JWT access + refresh tokens (Prisma + PostgreSQL on the backend, signals-based session on the frontend).

### 1. Environment

```bash
cp .env.example .env
```

Update secrets in `.env` before production (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`).

### 2. Start PostgreSQL

```bash
docker compose -f docker/docker-compose.yml up postgres -d
```

### 3. Run database migrations

From the repo root, ensure `.env` exists (`cp .env.example .env`), then:

```bash
cd backend
npm install
npm run prisma:migrate:dev
```

Prisma reads `DATABASE_URL` from the root `.env` file (not `backend/.env`).

### 4. Start the API (port 3001)

```bash
cd backend
npm run start:dev
```

### 5. Start the frontend (port 4200)

```bash
cd frontend
npm install
npm start
```

The dev server proxies `/api/*` to the backend (`PORT` from root `.env`, default `3001`). In the browser network tab, API calls will show as `http://localhost:4200/api/...` — that is expected; the Angular dev server forwards them to the NestJS API.

**Start the backend before the frontend**, or you'll see proxy `ECONNREFUSED` errors.

Open [http://localhost:4200/auth/register](http://localhost:4200/auth/register) to create an account, or [http://localhost:4200/auth/login](http://localhost:4200/auth/login) to sign in.

### API contract

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/auth/register` | `{ email, password }` | `{ accessToken, refreshToken }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ accessToken, refreshToken }` |
| POST | `/api/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| POST | `/api/auth/logout` | `{ refreshToken }` | `204` |
| GET | `/api/auth/me` | Bearer access token | `{ id, email }` |

## Git workflow

### Why files can go missing from commits

Two common causes in this monorepo:

1. **Never staged** — new folders like `backend/` stay untracked until you `git add` them.
2. **Nested `.git`** — running `nest new backend` or `ng new frontend` inside the repo creates a sub-repo. Git then ignores the inner files. Fix:
   ```bash
   rm -rf backend/.git   # or frontend/.git
   git add backend/
   ```

### Before committing (optional manual check)

```bash
npm run check:git
```

This lists untracked files and nested `.git` folders. Stage anything that should be tracked, then commit:

```bash
git add backend/ frontend/src/app/core/ ...
git commit -m "Your message"
```

### Security notes

- Passwords are stored as bcrypt hashes; refresh tokens are stored as SHA-256 hashes in PostgreSQL.
- Tokens are returned in the JSON body and stored in `localStorage` for simplicity. For production, consider httpOnly cookies for refresh tokens.
- Generate strong secrets with `openssl rand -base64 32`.
