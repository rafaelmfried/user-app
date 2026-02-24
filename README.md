# Users API

API simples para criar e listar usuarios com PostgreSQL, usando TypeScript e arquitetura hexagonal. Swagger disponivel em `/docs`.

**Stack**
- Node.js + TypeScript + Express
- PostgreSQL (pg)
- Swagger (swagger-jsdoc / swagger-ui-express)

**Requisitos**
- Node.js >= 18
- pnpm >= 7
- Docker + Docker Compose (para subir tudo via compose)

**Endpoints**
- GET `/health`
- GET `/users`
- POST `/users`

**Rodar com Docker (prod)**
```bash
docker compose -f docker/compose.yaml up -d --build
```
Acesse: `http://localhost:8080` e `http://localhost:8080/docs`

**Rodar em modo dev (hot reload)**
```bash
docker compose -f docker/compose.yaml --profile dev up -d --build api-dev
```

**Migrations do app**
```bash
make migrate
```

**Testes**
```bash
make test
make test-unit
make test-integration
make test-e2e
make test-coverage
make test-mutation
make test-watch
```

**Comandos do Makefile**
```bash
make build
make up
make down
make logs
make recriate
make check-scout
make migrate
```

**Debug de erros (opcional)**
```bash
DEBUG=true docker compose -f docker/compose.yaml up -d --build
```

**Licenca**
MIT

**Autor**
Rafael Friederick - rafael.friederick@unnamed-lab.com
GitHub: rafaelmfried
