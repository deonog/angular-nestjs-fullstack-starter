# angular-nestjs-fullstack-starter

Angular 22 + NestJS 11 + PostgreSQL starter with **feature-driven** layout, email/password JWT auth, Prisma 7, and Docker support.

**Requirements:** Node.js **26+** (see [`.nvmrc`](.nvmrc))

## Quick start (local dev)

Run from the **repo root** unless noted otherwise.

```bash
# 1. Node 26
nvm use    # or: fnm use / mise use

# 2. Environment
cp .env.example .env

# 3. Install dependencies
npm install
cd apps/backend && npm install && cd ../..
cd apps/frontend && npm install && cd ../..

# 4. Start PostgreSQL
docker compose up postgres -d

# 5. Run migrations (Prisma 7)
npm run prisma:migrate:dev

# 6. Start API (terminal 1) — port 3001
cd apps/backend && npm run start:dev

# 7. Start frontend (terminal 2) — port 4200
cd apps/frontend && npm start
```

Open [http://localhost:4200/auth/register](http://localhost:4200/auth/register) or [http://localhost:4200/auth/login](http://localhost:4200/auth/login).

---

## Folder structure

```
angular-nestjs-fullstack-starter/
├── apps/
│   ├── backend/                       # NestJS 11 API
│   │   └── src/
│   │       ├── core/                  # Prisma, config, guards
│   │       └── features/              # auth/ (domain features)
│   └── frontend/                      # Angular 22 SPA
│       └── src/
│           ├── app/
│           │   ├── core/              # auth/, interceptors/
│           │   ├── shared/            # Reusable UI (presentational)
│           │   └── features/          # auth/, home/
│           ├── environments/
│           └── proxy.conf.js
├── libs/
│   └── shared/                        # DTOs, types shared by both apps
├── prisma/                            # Schema + migrations (repo root)
├── prisma.config.ts
├── docker/
│   ├── backend/Dockerfile
│   ├── frontend/Dockerfile
│   └── nginx/nginx.conf
├── docker-compose.yml                 # Local development
├── docker-compose.prod.yml            # Production overrides
├── scripts/
│   └── check-repo.sh
├── .env.example
├── .nvmrc                             # Node 26
├── .prettierrc
└── package.json                       # npm workspaces root
```

### Feature-driven layout

| Layer                                          | Role                                              |
| ---------------------------------------------- | ------------------------------------------------- |
| `apps/frontend/src/app/features/auth/`         | Login, register views + lazy routes               |
| `apps/frontend/src/app/core/auth/`             | `AuthService`, `AuthStore`, guards                |
| `apps/backend/src/features/auth/`              | JWT auth: register, login, refresh, logout        |
| `apps/frontend/src/app/features/<name>/`       | Additional features — same pattern as `auth/`     |
| `apps/backend/src/features/<name>/`            | Additional features — same pattern as `auth/`     |
| `apps/frontend/src/app/core/` + `shared/`      | Cross-cutting Angular infrastructure              |
| `apps/backend/src/core/`                       | Cross-cutting NestJS infrastructure               |
| `libs/shared/`                                 | Shared DTOs and TypeScript types                  |

---

## All commands

### Repo root

| Command                                                      | Description                                  |
| ------------------------------------------------------------ | -------------------------------------------- |
| `nvm use`                                                    | Switch to Node 26 (from `.nvmrc`)            |
| `cp .env.example .env`                                       | Create local environment file                |
| `npm install`                                                | Install all workspace dependencies (root)    |
| `npm run build:backend`                                      | Build shared lib + NestJS API                |
| `npm run build:frontend`                                     | Build Angular SPA                            |
| `npm run prisma:generate`                                    | Regenerate Prisma client                     |
| `npm run prisma:migrate:dev`                                 | Run Prisma migrations                        |
| `npm run docker:dev`                                         | Start all services via Docker                |
| `npm run docker:prod`                                        | Start production stack                       |
| `npm run docker:down`                                        | Stop all services                            |
| `npm run docker:clean`                                       | Stop and delete DB volume                    |
| `docker compose up postgres -d`                              | Start PostgreSQL only                        |

### Backend (`cd apps/backend`)

| Command                      | Description                                                          |
| ---------------------------- | -------------------------------------------------------------------- |
| `npm install`                | Install dependencies                                                 |
| `npm run start:dev`          | API with hot reload (port **3001** from root `.env`)                 |
| `npm run build`              | Generate Prisma client + compile NestJS                              |
| `npm run lint`               | ESLint with auto-fix                                                 |
| `npm run format`             | Format backend TypeScript                                            |
| `npm run test:e2e`           | Auth e2e tests (requires Postgres running)                           |
| `npm run prisma:generate`    | Regenerate Prisma 7 client                                           |
| `npm run prisma:migrate:dev` | Create/apply migrations                                              |
| `npm run prisma:studio`      | Open Prisma Studio at [http://localhost:5555](http://localhost:5555) |

Prisma 7 reads `DATABASE_URL` from root `.env` via [`prisma.config.ts`](prisma.config.ts).

### Frontend (`cd apps/frontend`)

| Command          | Description                                                                 |
| ---------------- | --------------------------------------------------------------------------- |
| `npm install`    | Install dependencies                                                        |
| `npm start`      | Dev server at [http://localhost:4200](http://localhost:4200) with API proxy |
| `npm run build`  | Production build                                                            |
| `npm run format` | Format TypeScript, HTML, CSS                                                |

### Docker ports

| Port     | Service                               |
| -------- | ------------------------------------- |
| **4200** | Frontend (`ng serve` or Docker nginx) |
| **3001** | Backend on host (`PORT` in `.env`)    |
| **3000** | Backend in Docker                     |
| **5433** | PostgreSQL on host                    |
| **5555** | Prisma Studio                         |

---

## Code formatting (Prettier)

Shared config at [`.prettierrc`](.prettierrc). VS Code/Cursor: install [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) — [`.vscode/settings.json`](.vscode/settings.json) enables format-on-save.

```bash
npm run format          # format everything
npm run format:check    # verify only
```

---

## Auth & API

Email/password JWT auth with bcrypt, Prisma 7 + PostgreSQL, Angular 22 `@Service` session.

### API contract

| Method | Path                 | Body                  | Response                        |
| ------ | -------------------- | --------------------- | ------------------------------- |
| POST   | `/api/auth/register` | `{ email, password }` | `{ accessToken, refreshToken }` |
| POST   | `/api/auth/login`    | `{ email, password }` | `{ accessToken, refreshToken }` |
| POST   | `/api/auth/refresh`  | `{ refreshToken }`    | `{ accessToken, refreshToken }` |
| POST   | `/api/auth/logout`   | `{ refreshToken }`    | `204`                           |
| GET    | `/api/auth/me`       | Bearer access token   | `{ id, email }`                 |

### Security notes

- Passwords stored as bcrypt hashes; refresh tokens as SHA-256 hashes in PostgreSQL.
- Tokens in JSON body + `localStorage` (starter default). Consider httpOnly cookies for production.
- Generate secrets: `openssl rand -base64 32`

---

## Upgrade notes (v22 / Prisma 7)

### Angular 22 ([update guide](https://angular.dev/update-guide?v=21.0-22.0&l=1))

Applied automatically via `ng update`:

- **`@Service()` decorator** replaces `@Injectable({ providedIn: 'root' })` for singleton services
- **`provideHttpClient(withXhr(), ...)`** — required XHR backend for HTTP client
- **`ChangeDetectionStrategy.Eager`** on components (v22 default migration)
- **TypeScript 6.0** with Angular 22

Generate new services with the v22 default:

```bash
cd apps/frontend
ng generate service features/my-feature/my-feature
# Uses @Service() + inject() by default
# For custom providers: ng generate service --injectable
```

### Prisma 7

- Connection URL moved to [`apps/backend/prisma.config.ts`](apps/backend/prisma.config.ts)
- Client generated to `apps/backend/generated/prisma/` (not `node_modules`)
- Runtime uses `@prisma/adapter-pg` driver adapter
- Run `prisma generate` explicitly after schema changes (`npm run build` does this)

### Node 26

Required for Angular 22. Set via `.nvmrc`, `engines` in `package.json`, and `node:26-alpine` in Dockerfiles.

---

## Reusing this starter for a new project

### Make this repo a GitHub template (one-time)

1. Push to GitHub
2. Repo **Settings** → **General** → enable **Template repository**
3. New projects: **Use this template** → **Create a new repository**

### Create a new project

```bash
git clone git@github.com:YOU/my-new-app.git
cd my-new-app
cp .env.example .env
# Update DATABASE_URL, JWT secrets, docker compose POSTGRES_DB if needed
nvm use
cd apps/backend && npm install && npm run prisma:migrate:dev
cd ../frontend && npm install
docker compose -f docker/docker-compose.yml up postgres -d
```

### Add a new feature

**Backend** (`apps/backend`):

```bash
nest g module modules/products
nest g controller modules/products --no-spec
nest g service modules/products --no-spec
```

Add Prisma models → `npm run prisma:migrate:dev -- --name add_products` → import module in `app.module.ts`.

**Frontend** (`apps/frontend`):

Create `src/app/features/products/` with components, `@Service()` service, and routes. Lazy-load in `app.routes.ts`.

### Avoid nested git repos

```bash
nest new apps/backend   # or ng new
rm -rf apps/backend/.git
git add apps/backend/
```

### Before committing

```bash
npm run check:git
git add .
git commit -m "Your message"
```

---

## Git workflow

1. **Never staged** — new folders stay untracked until `git add`
2. **Nested `.git`** — `nest new` / `ng new` inside the repo hides files from the monorepo

```bash
rm -rf apps/backend/.git
git add apps/backend/
```
