-- Script de inicializacao para Postgres.
-- O banco e o usuario ja sao criados pelo entrypoint via POSTGRES_DB/USER/PASSWORD.

-- Garante schema publico e privilegios basicos.
CREATE SCHEMA IF NOT EXISTS public;
GRANT ALL ON SCHEMA public TO "user";
GRANT ALL PRIVILEGES ON DATABASE mydb TO "user";
