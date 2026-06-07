# angular-nestjs-fullstack-starter

Angular 22 + NestJS 11 + PostgreSQL starter with **feature-driven** layout, email/password JWT auth, Prisma 7, and Docker support.

**Requirements:** Node.js **26+** (see [`.nvmrc`](.nvmrc))

## Initial setup

First-time setup from a fresh clone. Run all commands from the **repo root** unless noted.

### Prerequisites

| Tool    | Version      | Notes                                      |
| ------- | ------------ | ------------------------------------------ |
| Node.js | **26+**      | `nvm use` reads [`.nvmrc`](.nvmrc)         |
| Docker  | recent       | Runs PostgreSQL locally                    |
| npm     | 11+          | Bundled with Node 26                       |

### 1. Clone and install

```bash
# From GitHub template: Use this template → Create a new repository, then:
git clone git@github.com:YOU/your-new-app.git
cd your-new-app
nvm use    # or: fnm use / mise use
npm install
```

npm workspaces install dependencies for `apps/backend`, `apps/frontend`, and `libs/shared` in one step.

### 2. Configure environment

```bash
cp .env.example .env
```

Replace the placeholder JWT secrets before running the API:

```bash
openssl rand -base64 32   # run twice — once for access, once for refresh
```

| Variable             | Default                                              | Action                          |
| -------------------- | ---------------------------------------------------- | ------------------------------- |
| `POSTGRES_DB`        | `starter`                                            | Rename when creating a new app  |
| `DATABASE_URL`       | `postgresql://postgres:changeme@localhost:5433/starter` | Must match `POSTGRES_DB`     |
| `JWT_ACCESS_SECRET`  | `changeme`                                           | **Replace**                     |
| `JWT_REFRESH_SECRET` | `changeme`                                           | **Replace**                     |

When renaming the project, also update package names in `package.json`, `libs/shared/package.json`, `docker-compose.yml`, and all `@angular-nestjs-fullstack-starter/shared` imports.

### 3. Start PostgreSQL

```bash
docker compose up postgres -d
```

Postgres is exposed on **5433** on the host (container port 5432).

### 4. Run database migrations

```bash
npm run prisma:migrate:dev
```

Creates tables from `prisma/schema.prisma` and applies pending migrations.

### 5. Start the dev servers

Use **two terminals**:

**Terminal 1 — API** (port **3001**):

```bash
cd apps/backend && npm run start:dev
```

`prestart:dev` automatically generates the Prisma client and builds `@angular-nestjs-fullstack-starter/shared` before the server starts.

**Terminal 2 — Frontend** (port **4200**):

```bash
cd apps/frontend && npm start
```

### 6. Verify

| URL                                                                 | Expected                          |
| ------------------------------------------------------------------- | --------------------------------- |
| [localhost:4200/auth/register](http://localhost:4200/auth/register)   | Registration form                 |
| [localhost:4200/auth/login](http://localhost:4200/auth/login)       | Login form                        |
| [localhost:3001/api/auth/me](http://localhost:3001/api/auth/me)     | `401` without a token (API is up) |

### Troubleshooting

| Problem                                                          | Fix                                                                 |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| `Cannot find module '@angular-nestjs-fullstack-starter/shared'`   | `npm run build -w @angular-nestjs-fullstack-starter/shared`         |
| `Cannot find module '../../generated/prisma/client'`             | `npm run prisma:generate`                                           |
| `EADDRINUSE :::3001`                                             | `lsof -ti :3001 \| xargs kill`                                      |
| DB errors after changing `POSTGRES_DB`                           | `npm run docker:clean && docker compose up postgres -d` then re-run migrations |

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

- Connection URL configured in [`prisma.config.ts`](prisma.config.ts) (reads root `.env`)
- Client generated to `apps/backend/src/generated/prisma/` (not `node_modules`)
- Runtime uses `@prisma/adapter-pg` driver adapter
- Run `prisma generate` explicitly after schema changes (`npm run build` does this)

### Node 26

Required for Angular 22. Set via `.nvmrc`, `engines` in `package.json`, and `node:26-alpine` in Dockerfiles.

---

## Using this as a GitHub template

### One-time (repo owner)

1. Push to GitHub
2. Repo **Settings** → **General** → enable **Template repository**

### Create a new project

1. On GitHub: **Use this template** → **Create a new repository**
2. Follow the [**Initial setup**](#initial-setup) section above
3. Rename the project:
   - Root `package.json` `name` and `docker-compose.yml` `name`
   - `libs/shared/package.json` `name` (e.g. `@my-app/shared`)
   - `@angular-nestjs-fullstack-starter/shared` imports and workspace references
   - `POSTGRES_DB` and `DATABASE_URL` in `.env`

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
