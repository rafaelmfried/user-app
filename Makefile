.PHONY: build up down logs recriate check-scout migrate \
        test test-unit test-integration test-e2e test-coverage test-mutation \
        test-build test-watch

# ==================== Application ====================
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

migrate:
	docker compose -f docker/compose.yaml --profile tools run --rm migrate

# ==================== Testing ====================
# Image name for test containers
TEST_IMAGE := api-test:latest

# Build test image (deps stage with source files)
test-build:
	@echo "Building test image..."
	docker build -f docker/Dockerfile --target deps -t $(TEST_IMAGE) .

# Run all tests
test: test-build
	@echo "Running all tests..."
	docker run --rm \
		-v /var/run/docker.sock:/var/run/docker.sock \
		-v $(PWD)/src:/app/src:ro \
		-v $(PWD)/tests:/app/tests:ro \
		-v $(PWD)/migrations:/app/migrations:ro \
		-v $(PWD)/jest.config.ts:/app/jest.config.ts:ro \
		-v $(PWD)/tsconfig.json:/app/tsconfig.json:ro \
		-e NODE_ENV=test \
		-e TESTCONTAINERS_RYUK_DISABLED=true \
		$(TEST_IMAGE) pnpm test

# Run unit tests only (fast, no Docker socket needed)
test-unit: test-build
	@echo "Running unit tests..."
	docker run --rm \
		-v $(PWD)/src:/app/src:ro \
		-v $(PWD)/tests:/app/tests:ro \
		-v $(PWD)/jest.config.ts:/app/jest.config.ts:ro \
		-v $(PWD)/tsconfig.json:/app/tsconfig.json:ro \
		-e NODE_ENV=test \
		$(TEST_IMAGE) pnpm test:unit

# Run integration tests (requires Docker socket for Testcontainers)
test-integration: test-build
	@echo "Running integration tests..."
	docker run --rm \
		-v /var/run/docker.sock:/var/run/docker.sock \
		-v $(PWD)/src:/app/src:ro \
		-v $(PWD)/tests:/app/tests:ro \
		-v $(PWD)/jest.config.ts:/app/jest.config.ts:ro \
		-v $(PWD)/tsconfig.json:/app/tsconfig.json:ro \
		-v $(PWD)/migrations:/app/migrations:ro \
		-e NODE_ENV=test \
		-e TESTCONTAINERS_RYUK_DISABLED=true \
		$(TEST_IMAGE) pnpm test:integration

# Run E2E tests (requires Docker socket for Testcontainers)
test-e2e: test-build
	@echo "Running E2E tests..."
	docker run --rm \
		-v /var/run/docker.sock:/var/run/docker.sock \
		-v $(PWD)/src:/app/src:ro \
		-v $(PWD)/tests:/app/tests:ro \
		-v $(PWD)/jest.config.ts:/app/jest.config.ts:ro \
		-v $(PWD)/tsconfig.json:/app/tsconfig.json:ro \
		-v $(PWD)/migrations:/app/migrations:ro \
		-e NODE_ENV=test \
		-e TESTCONTAINERS_RYUK_DISABLED=true \
		$(TEST_IMAGE) pnpm test:e2e

# Run tests with coverage report
test-coverage: test-build
	@echo "Running tests with coverage..."
	docker run --rm \
		-v /var/run/docker.sock:/var/run/docker.sock \
		-v $(PWD)/src:/app/src:ro \
		-v $(PWD)/tests:/app/tests:ro \
		-v $(PWD)/jest.config.ts:/app/jest.config.ts:ro \
		-v $(PWD)/tsconfig.json:/app/tsconfig.json:ro \
		-v $(PWD)/migrations:/app/migrations:ro \
		-v $(PWD)/coverage:/app/coverage \
		-e NODE_ENV=test \
		-e TESTCONTAINERS_RYUK_DISABLED=true \
		$(TEST_IMAGE) pnpm test:coverage
	@echo "Coverage report available at: coverage/lcov-report/index.html"

# Run mutation testing with Stryker
test-mutation: test-build
	@echo "Running mutation tests with Stryker..."
	docker run --rm \
		-v /var/run/docker.sock:/var/run/docker.sock \
		-v $(PWD)/src:/app/src:ro \
		-v $(PWD)/tests:/app/tests:ro \
		-v $(PWD)/migrations:/app/migrations:ro \
		-v $(PWD)/jest.config.ts:/app/jest.config.ts:ro \
		-v $(PWD)/jest.mutation.config.ts:/app/jest.mutation.config.ts:ro \
		-v $(PWD)/tsconfig.json:/app/tsconfig.json:ro \
		-v $(PWD)/stryker.config.mjs:/app/stryker.config.mjs:ro \
		-v $(PWD)/reports:/app/reports \
		-e NODE_ENV=test \
		-e TESTCONTAINERS_RYUK_DISABLED=true \
		$(TEST_IMAGE) pnpm test:mutation
	@echo "Mutation report available at: reports/mutation/html/"

# Run tests in watch mode (for development)
test-watch: test-build
	@echo "Running tests in watch mode..."
	docker run --rm -it \
		-v $(PWD)/src:/app/src \
		-v $(PWD)/tests:/app/tests \
		-v $(PWD)/jest.config.ts:/app/jest.config.ts:ro \
		-v $(PWD)/tsconfig.json:/app/tsconfig.json:ro \
		-e NODE_ENV=test \
		$(TEST_IMAGE) pnpm test:watch