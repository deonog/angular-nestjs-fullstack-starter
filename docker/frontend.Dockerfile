# Development stage
FROM node:26-alpine AS dev
WORKDIR /app
COPY apps/frontend/package*.json ./
RUN npm install
COPY apps/frontend/ .
EXPOSE 4200
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "500"]

# Production stage
FROM node:26-alpine AS build
WORKDIR /app
COPY apps/frontend/package*.json ./
RUN npm ci
COPY apps/frontend/ .
RUN npm run build

FROM nginx:alpine AS prod
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
