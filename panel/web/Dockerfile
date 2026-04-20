FROM node:24-alpine AS base
WORKDIR /app
COPY package.json ./
RUN npm install

# ---- development (default for docker-compose) ----
FROM base AS dev
COPY . .
# Polling watcher for Docker volume mounts on Windows/Mac hosts
ENV WATCHPACK_POLLING=true
CMD ["npm", "run", "dev"]

# ---- production build ----
# NEXT_PUBLIC_* vars are baked in at build time; pass via --build-arg if they differ from defaults.
FROM base AS build
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG NEXT_PUBLIC_WS_URL=ws://localhost:4000/graphql-ws
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
COPY . .
RUN npm run build

FROM node:24-alpine AS prod
WORKDIR /app
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY package.json ./
RUN npm install --omit=dev
ENV NODE_ENV=production
CMD ["npm", "run", "start"]
