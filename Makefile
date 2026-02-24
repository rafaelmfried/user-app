.PHONY: build up down logs recriate check-scout

build:
	docker-compose -f docker/compose.yaml build

up:
	docker-compose -f docker/compose.yaml up -d

down:
	docker-compose -f docker/compose.yaml down

logs:
	docker-compose -f docker/compose.yaml logs --follow

recriate: down up

check-scout:
	./scripts/scout.sh api-image:1.0.0