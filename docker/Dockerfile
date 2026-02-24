# Stage 1: Base -> Instalacao das dependencias globais
FROM node:22.20.0-alpine AS base
WORKDIR /app
# Instalar pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Stage 2: Build -> Copia os arquivos e instala as dependencias do projeto
FROM base AS build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Stage 3: Development -> Configura o ambiente de desenvolvimento
FROM build AS development
ENV NODE_ENV=development
EXPOSE 3000
CMD ["pnpm", "run", "dev"]

# Stage 4: Production -> Configura o ambiente de produção
FROM build AS production
ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "run", "start"]