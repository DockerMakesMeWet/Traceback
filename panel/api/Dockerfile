FROM node:24-alpine AS base
WORKDIR /app
COPY package.json ./
RUN npm install

# ---- development (default for docker-compose) ----
FROM base AS dev
COPY . .
CMD ["npm", "run", "dev"]

# ---- production build ----
FROM base AS build
COPY . .
RUN npm run build

FROM node:24-alpine AS prod
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package.json ./
RUN npm install --omit=dev
CMD ["node", "dist/index.js"]
