# angular-nestjs-fullstack-starter

Angular 21 + NestJS 11 + PostgreSQL starter with **feature-driven** layout, email/password JWT auth, and Docker support.

## Quick start (local dev)

Run from the **repo root** unless noted otherwise.

```bash
# 1. Environment
cp .env.example .env

# 2. Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 3. Start PostgreSQL
docker compose -f docker/docker-compose.yml up postgres -d

# 4. Run migrations
cd backend && npm run prisma:migrate:dev && cd ..

# 5. Start API (terminal 1) — port 3001
cd backend && npm run start:dev

# 6. Start frontend (terminal 2) — port 4200
cd frontend && npm start
```

Open [http://localhost:4200/auth/register](http://localhost:4200/auth/register) or [http://localhost:4200/auth/login](http://localhost:4200/auth/login).

---

## All commands

### Repo root

| Command                                                      | Description                                                      |
| ------------------------------------------------------------ | ---------------------------------------------------------------- |
| `cp .env.example .env`                                       | Create local environment file                                    |
| `npm install`                                                | Install root dev tools (Prettier, check script)                  |
| `npm run format`                                             | Format entire repo with Prettier                                 |
| `npm run format:check`                                       | Check formatting without writing files (CI-friendly)             |
| `npm run check:git`                                          | List untracked files and nested `.git` folders before committing |
| `docker compose -f docker/docker-compose.yml up postgres -d` | Start PostgreSQL only                                            |
| `docker compose -f docker/docker-compose.yml up -d`          | Start all services (Postgres + backend + frontend)               |
| `docker compose -f docker/docker-compose.yml up --build`     | Rebuild and start all services                                   |
| `docker compose -f docker/docker-compose.yml down`           | Stop all services                                                |
| `docker compose -f docker/docker-compose.yml down -v`        | Stop services and delete Postgres volume                         |

### Backend (`cd backend`)

| Command                      | Description                                                          |
| ---------------------------- | -------------------------------------------------------------------- |
| `npm install`                | Install dependencies                                                 |
| `npm run start:dev`          | Start API with hot reload (port from root `.env`, default **3001**)  |
| `npm run start`              | Start API without watch                                              |
| `npm run start:debug`        | Start API with debugger                                              |
| `npm run start:prod`         | Run compiled production build                                        |
| `npm run build`              | Compile TypeScript to `dist/`                                        |
| `npm run lint`               | Run ESLint with auto-fix                                             |
| `npm run format`             | Format backend TypeScript with Prettier (uses root `.prettierrc`)    |
| `npm run format:check`       | Check backend formatting without writing                             |
| `npm test`                   | Run unit tests                                                       |
| `npm run test:watch`         | Run unit tests in watch mode                                         |
| `npm run test:cov`           | Run unit tests with coverage                                         |
| `npm run test:e2e`           | Run end-to-end auth tests                                            |
| `npm run prisma:generate`    | Regenerate Prisma client after schema changes                        |
| `npm run prisma:migrate:dev` | Create/apply migrations (reads root `.env`)                          |
| `npm run prisma:studio`      | Open Prisma Studio at [http://localhost:5555](http://localhost:5555) |

Prisma commands load `DATABASE_URL` from the **root** `.env` via `dotenv-cli` — there is no `backend/.env`.

### Frontend (`cd frontend`)

| Command                | Description                                                                 |
| ---------------------- | --------------------------------------------------------------------------- |
| `npm install`          | Install dependencies                                                        |
| `npm start`            | Dev server at [http://localhost:4200](http://localhost:4200) with API proxy |
| `npm run format`       | Format frontend TypeScript, HTML, and CSS with Prettier                     |
| `npm run format:check` | Check frontend formatting without writing                                   |
| `npm run build`        | Production build to `dist/frontend`                                         |
| `npm run watch`        | Build in watch mode (development)                                           |
| `npm test`             | Run unit tests (Vitest)                                                     |
| `npm run ng -- <args>` | Run Angular CLI directly                                                    |

The dev server proxies `/api/*` → `http://localhost:<PORT>` (from root `.env`). API calls in the browser network tab show as `localhost:4200/api/...` — that is expected.

### Code formatting (Prettier)

One shared config at the repo root ([`.prettierrc`](.prettierrc)) covers backend, frontend, and markdown.

```bash
# From repo root — format everything
npm install
npm run format

# Check only (useful before commit / in CI)
npm run format:check

# Or format one app
cd backend && npm run format
cd frontend && npm run format
```

**VS Code / Cursor:** Install the [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode). [`.vscode/settings.json`](.vscode/settings.json) enables format-on-save for the workspace.

Settings: 100 char line width, single quotes, trailing commas. Angular templates use the `angular` parser.

### Docker ports

| Port     | Service                                          | Notes |
| -------- | ------------------------------------------------ | ----- |
| **4200** | Frontend (nginx in Docker) or `ng serve` on host |
| **3001** | Backend on host (`PORT` in `.env`)               |
| **3000** | Backend in Docker (`docker compose up`)          |
| **5433** | PostgreSQL on host                               |
| **5555** | Prisma Studio (when running)                     |

### Useful one-liners

```bash
# Generate production JWT secrets
openssl rand -base64 32

# Connect to Postgres directly
psql postgresql://postgres:postgres@localhost:5433/starter

# Check API is running
curl -i http://localhost:3001/api/auth/me

# Preview what git would add from backend
git add -n backend/
```

---

## Auth & API

Email/password authentication with JWT access + refresh tokens (bcrypt passwords, Prisma + PostgreSQL, Angular signals session).

### API contract

| Method | Path                 | Body                  | Response                        |
| ------ | -------------------- | --------------------- | ------------------------------- |
| POST   | `/api/auth/register` | `{ email, password }` | `{ accessToken, refreshToken }` |
| POST   | `/api/auth/login`    | `{ email, password }` | `{ accessToken, refreshToken }` |
| POST   | `/api/auth/refresh`  | `{ refreshToken }`    | `{ accessToken, refreshToken }` |
| POST   | `/api/auth/logout`   | `{ refreshToken }`    | `204`                           |
| GET    | `/api/auth/me`       | Bearer access token   | `{ id, email }`                 |

### Security notes

- Passwords are stored as bcrypt hashes; refresh tokens are stored as SHA-256 hashes in PostgreSQL.
- Tokens are returned in the JSON body and stored in `localStorage` for simplicity. For production, consider httpOnly cookies for refresh tokens.
- Generate strong secrets with `openssl rand -base64 32`.

---

## Reusing this starter for a new project

### Make this repo a GitHub template (one-time, repo owner)

Do this once on `angular-nestjs-fullstack-starter` so **Use this template** appears for you and others.

1. Push this project to GitHub if it is not there yet:
   ```bash
   git remote add origin git@github.com:YOUR_USER/angular-nestjs-fullstack-starter.git
   git push -u origin main
   ```
2. Open the repo in the browser: `https://github.com/YOUR_USER/angular-nestjs-fullstack-starter`
3. Click **Settings** (top tab bar on the repo — not your account settings).
4. Under **General** (default section), scroll to **Repository name**.
5. Enable **Template repository** and save.

After that, on the repo **Code** page you will see a green **Use this template** button (next to **Code**, **Issues**, etc.).

To start a new app from it: **Use this template** → **Create a new repository** → pick name/visibility → **Create repository**.

### 1. Create your project from this template

**Option A — GitHub template (recommended)**

Requires **Template repository** enabled (see above).

1. Open the starter on GitHub → **Use this template** → **Create a new repository**.
2. Clone your new repo:
   ```bash
   git clone git@github.com:you/my-new-app.git
   cd my-new-app
   ```

**Option B — Clone and re-init**

```bash
git clone git@github.com:you/angular-nestjs-fullstack-starter.git my-new-app
cd my-new-app
rm -rf .git
git init
git add .
git commit -m "Initial commit from angular-nestjs-fullstack-starter"
```

**Option C — Copy without history**

```bash
cp -r angular-nestjs-fullstack-starter my-new-app
cd my-new-app
rm -rf .git backend/.git frontend/.git
git init
```

### 2. Rename and configure

```bash
cp .env.example .env
```

Update `.env` for your project:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/my_app_db
JWT_ACCESS_SECRET=<generate with: openssl rand -base64 32>
JWT_REFRESH_SECRET=<generate with: openssl rand -base64 32>
PORT=3001
```

If you change the database name, also update `POSTGRES_DB` in [`docker/docker-compose.yml`](docker/docker-compose.yml) and the Docker `DATABASE_URL` for the backend service.

Optionally rename the npm package names in [`package.json`](package.json), [`backend/package.json`](backend/package.json), and [`frontend/package.json`](frontend/package.json).

### 3. First-time setup (same as quick start)

```bash
cd backend && npm install && npm run prisma:migrate:dev && cd ..
cd frontend && npm install && cd ..
docker compose -f docker/docker-compose.yml up postgres -d
```

Then start backend and frontend in separate terminals (see [Quick start](#quick-start-local-dev)).

### 4. Add a new feature

Follow the same pattern as `auth/` on both sides:

**Backend**

```bash
cd backend
nest g module modules/products
nest g controller modules/products --no-spec
nest g service modules/products --no-spec
```

1. Add Prisma models in [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma).
2. Run `npm run prisma:migrate:dev -- --name add_products`.
3. Import your module in [`backend/src/app.module.ts`](backend/src/app.module.ts).
4. Protect routes with `@UseGuards(JwtAuthGuard)` where needed.

**Frontend**

1. Create `frontend/src/app/features/products/` with components, service, and routes.
2. Lazy-load in [`frontend/src/app/app.routes.ts`](frontend/src/app/app.routes.ts).
3. Call the API via `HttpClient` — the auth interceptor attaches the JWT automatically.

### 5. Scaffold tools — avoid nested git repos

If you regenerate the backend or frontend with CLI tools **inside** the monorepo:

```bash
nest new backend    # or: ng new frontend
rm -rf backend/.git # always remove nested .git immediately
git add backend/
```

Without removing `backend/.git`, Git tracks an empty folder and your source files never appear in commits.

### 6. Check nothing is missed before committing

```bash
npm run check:git
git add .
git status
git commit -m "Add products feature"
```

---

## Folder structure

```
angular-nestjs-fullstack-starter/
├── docker/
│   ├── docker-compose.yml             # Postgres + backend + frontend
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── nginx.conf                     # Proxies /api → backend
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── core/                  # Guards, interceptors
│       │   ├── shared/                # Models, reusable UI
│       │   ├── features/              # One folder per feature
│       │   │   ├── auth/
│       │   │   └── <feature-name>/
│       │   ├── app.config.ts
│       │   └── app.routes.ts
│       ├── environments/
│       └── proxy.conf.js              # Dev proxy → backend PORT
├── backend/
│   ├── prisma/                        # Schema + migrations
│   └── src/
│       ├── common/
│       ├── config/
│       ├── modules/                   # One Nest module per feature
│       │   ├── auth/
│       │   └── <feature-name>/
│       ├── prisma/
│       ├── app.module.ts
│       └── main.ts
├── scripts/
│   └── check-repo.sh                  # Untracked file checker
├── .prettierrc                        # Shared Prettier config (backend + frontend)
├── .prettierignore
├── .vscode/settings.json              # Format on save (Prettier)
├── .env.example
└── package.json                       # Root scripts (check:git)
```

### Feature-driven layout

| Layer                                       | Role                                              |
| ------------------------------------------- | ------------------------------------------------- |
| `frontend/src/app/features/auth/`           | Login, register, `auth.service` (tokens, session) |
| `backend/src/modules/auth/`                 | JWT auth: register, login, refresh, logout        |
| `frontend/src/app/features/<feature-name>/` | Additional features — same pattern as `auth/`     |
| `backend/src/modules/<feature-name>/`       | Additional features — same pattern as `auth/`     |
| `frontend/src/app/core/` + `shared/`        | Cross-cutting Angular code                        |
| `backend/src/common/` + `config/`           | Cross-cutting NestJS code and PostgreSQL setup    |

---

## Git workflow

### Why files can go missing from commits

1. **Never staged** — new folders like `backend/` stay untracked until you `git add` them.
2. **Nested `.git`** — `nest new` / `ng new` inside the repo creates a sub-repo. Git ignores inner files until you remove it:
   ```bash
   rm -rf backend/.git
   git add backend/
   ```

### Before committing

```bash
npm run check:git
git add .
git commit -m "Your message"
```
