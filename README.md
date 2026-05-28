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
│       │   │   │   ├── jwt.strategy.ts            # validates access token
│       │   │   │   └── jwt-refresh.strategy.ts    # validates refresh token
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
│       ├── migrations/                # PostgreSQL schema migrations
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
