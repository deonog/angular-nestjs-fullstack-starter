# ── Stage 1: Install production dependencies ───────────────────────────────────
FROM node:26-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY libs/shared/package.json ./libs/shared/
COPY prisma/schema.prisma ./prisma/

ENV DATABASE_URL=postgresql://build:build@localhost:5432/build

RUN npm ci --workspace=apps/backend --omit=dev && \
    npm run build --workspace=@angular-nestjs-fullstack-starter/shared && \
    npm exec --workspace=apps/backend -- prisma generate --config prisma.config.ts

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM node:26-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY libs/shared/package.json ./libs/shared/
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY libs/shared ./libs/shared
COPY apps/backend ./apps/backend

ENV DATABASE_URL=postgresql://build:build@localhost:5432/build

RUN npm ci --workspace=apps/backend && \
    npm run build:backend

# ── Stage 3: Production image ─────────────────────────────────────────────────
FROM node:26-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=deps /app/libs/shared/dist ./libs/shared/dist
COPY --from=deps /app/libs/shared/package.json ./libs/shared/package.json
COPY --from=build /app/apps/backend/dist ./dist
COPY --from=deps /app/prisma ./prisma

USER appuser

EXPOSE 3000
CMD ["node", "dist/main.js"]
