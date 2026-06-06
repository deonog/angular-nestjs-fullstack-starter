# Development stage
FROM node:26-alpine AS dev
WORKDIR /app
COPY apps/backend/package*.json ./
RUN npm install
COPY apps/backend/ .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# Production stage
FROM node:26-alpine AS build
WORKDIR /app
COPY apps/backend/package*.json ./
RUN npm ci
COPY apps/backend/ .
RUN npx prisma generate
RUN npm run build

FROM node:26-alpine AS prod
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist/generated ./dist/generated
COPY apps/backend/package*.json ./
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["node", "dist/main"]
