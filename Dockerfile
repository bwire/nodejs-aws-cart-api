FROM node:16.15.1-alpine AS base
LABEL maintainer="e.barbedwire@gmail.com"

WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm i

# Build
WORKDIR /app
COPY . .
RUN npm run build

# App
FROM node:16.15.1-alpine AS app

WORKDIR /app

COPY --from=base /app/package*.json ./
RUN npm i --only production
COPY --from=base /app/dist ./dist

USER node
EXPOSE 4000
ENTRYPOINT ["node", "dist/main.js"]