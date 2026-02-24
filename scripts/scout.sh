#!/usr/bin/env sh

# Script para verificar vulnerabilidades em uma imagem usando o Docker Scout.
set -eu

IMAGE="${1:-}"
if [ -z "$IMAGE" ]; then
  echo "Usage: $0 <image-ref>"
  exit 2
fi

if ! docker scout version >/dev/null 2>&1; then
  echo "Docker Scout nao esta disponivel no seu Docker CLI."
  echo "Ative o Docker Scout no Docker Desktop ou instale o plugin."
  exit 1
fi

docker scout cves --only-fixed --exit-code "$IMAGE"
