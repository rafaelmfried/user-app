# Stage 0: Instalação do Node.js e configuração do ambiente
ARG NODE_VERSION=22.20.0
FROM debian:trixie AS setup
ARG NODE_VERSION
ENV NODE_VERSION=${NODE_VERSION}
# Instalar Node.js exato e dependências necessárias
RUN apt-get update && apt-get install -y curl ca-certificates xz-utils \
    && ARCH="$(dpkg --print-architecture)" \
    && case "$ARCH" in \
         amd64) NODE_ARCH="x64" ;; \
         arm64) NODE_ARCH="arm64" ;; \
         armhf) NODE_ARCH="armv7l" ;; \
         *) echo "Arquitetura não suportada: $ARCH" >&2; exit 1 ;; \
       esac \
    && curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz" \
    && tar -xJf "node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz" -C /usr/local --strip-components=1 \
    && rm "node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz" \
    && npm install -g corepack \
    && corepack enable \
    && corepack prepare pnpm@latest --activate \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Stage 1: Base -> Instalacao das dependencias globais
FROM setup AS base
WORKDIR /app

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
