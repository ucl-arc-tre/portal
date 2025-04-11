.PHONY: *
DEV_PROJECT_NAME := "ucl-arc-tre-portal-dev"

help: ## Show this help
	@echo
	@grep -E '^[a-zA-Z_0-9-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%s\033[0m|%s\n", $$1, $$2}' \
        | column -t -s '|'
	@echo

dev: codegen  ## Create dev environment
	cd deploy/dev && docker compose -p $(DEV_PROJECT_NAME) up --build

dev-up: ## Docker compose up on the dev environment
	cd deploy/dev && docker compose -p $(DEV_PROJECT_NAME) up

dev-destroy: ## Destroy the dev environment
	cd deploy/dev &&  docker compose -p $(DEV_PROJECT_NAME) down

codegen:  ## Run the code generation
	oapi-codegen -package openapi -generate "gin,types" api.web.yaml > "internal/openapi/web/main.gen.go"
	cd web && npm run openapi-ts

test:  ## Run all tests
	$(MAKE) test-unit
	$(MAKE) test-e2e

test-unit:  ## Run unit tests
	go test ./...

# Run Cypress locally against dockerised dev server
# make sure the dockerised dev server is running first with `make dev`
test-e2e-dev:
	cd web && CYPRESS_baseUrl=http://localhost:8000 npx cypress run --headless --browser chrome

## Run cypress against the release build
test-e2e-release:
	cd e2e && \
	docker compose -p "ucl-arc-tre-e2e" build && \
	docker compose -p "ucl-arc-tre-e2e" run --rm cypress && \
	docker compose -p "ucl-arc-tre-e2e" down --remove-orphans

web-lint: ## Lint frontend web things
	cd web && npm run lint

web-format:
	cd web && npx prettier --write .
