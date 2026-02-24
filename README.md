# Users API

API simples para criar e listar usuarios com PostgreSQL, escrita em TypeScript e arquitetura hexagonal. Swagger em `/docs`.

## **Arquitetura (hexagonal)**

```mermaid
flowchart LR
  subgraph Presentation
    C[Client/HTTP] --> API[Express Controllers]
  end
  subgraph Application
    API --> UC[Use Cases]
    UC --> Ports[Repository Port]
  end
  subgraph Domain
    UC --> Domain[User / Email]
  end
  subgraph Infrastructure
    Ports --> PgRepo[Pg Repository]
    PgRepo --> DB[(PostgreSQL)]
  end
```

## **Stack**

- Node.js + TypeScript + Express
- PostgreSQL (pg)
- Swagger (swagger-jsdoc / swagger-ui-express)

## **Requisitos**

- Node.js >= 18
- pnpm >= 7
- Docker + Docker Compose

## **Endpoints**

| Metodo | Rota    | Descricao      |
| ------ | ------- | -------------- |
| GET    | /health | Health check   |
| GET    | /users  | Lista usuarios |
| POST   | /users  | Cria usuario   |

## **Rodar com Docker (prod)**

```bash
docker compose -f docker/compose.yaml up -d --build
```

Acesse:

- `http://localhost:8080`
- `http://localhost:8080/docs`

## **Rodar em modo dev (hot reload)**

```bash
docker compose -f docker/compose.yaml --profile dev up -d --build api-dev
```

## **Migrations**

```bash
make migrate
```

## **Testes**

```bash
make test
make test-unit
make test-integration
make test-e2e
make test-coverage
make test-mutation
make test-watch
```

## **Comandos do Makefile**

```bash
make build
make up
make down
make logs
make recriate
make check-scout
make migrate
```

## **Variaveis de ambiente (principais)**

- `DATABASE_URL`
- `PORT`
- `NODE_ENV`
- `DEBUG` / `DEBUG_ERRORS`

## **Licenca**

MIT

## **Autor**

Rafael Friederick - rafael.friederick@unnamed-lab.com
GitHub: rafaelmfried
