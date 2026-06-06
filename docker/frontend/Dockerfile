# ── Stage 1: Build Angular app ────────────────────────────────────────────────
FROM node:26-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY libs/shared/package.json ./libs/shared/
COPY libs/shared ./libs/shared
COPY apps/frontend ./apps/frontend

RUN npm ci --workspace=apps/frontend && \
    npm run build:frontend -- --configuration=production

# ── Stage 2: Serve with Nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

RUN rm /etc/nginx/conf.d/default.conf

COPY docker/nginx/nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=build /app/apps/frontend/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
