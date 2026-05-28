# Development stage
FROM node:20-alpine AS dev
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# Production stage
FROM node:20-alpine AS build
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npm run build

FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY backend/package*.json ./
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["node", "dist/main"]
