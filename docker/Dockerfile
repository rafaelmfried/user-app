# Stage 0: Base Alpine com Node exato
ARG NODE_VERSION=22.20.0
ARG ALPINE_VERSION=3.20
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base
WORKDIR /app

# Stage 1: Dependencias (com dev para build)
FROM base AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM deps AS build
COPY . .
RUN pnpm run build \
    && pnpm prune --prod

# Stage 3: Runtime minimo
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY package.json ./
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
