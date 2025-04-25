SHELL := /bin/bash
.PHONY: *
DEV_PROJECT_NAME := "ucl-arc-tre-portal-dev"
E2E_PROJECT_NAME := "ucl-arc-tre-e2e"


define assert_file_exists
	if [ ! -f $(1) ]; then \
		echo -e "\033[0;31mERROR\033[0m: $(1) did not exist" && exit 1; \
	fi
endef


help: ## Show this help
	@echo
	@grep -E '^[a-zA-Z_0-9-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%s\033[0m|%s\n", $$1, $$2}' \
        | column -t -s '|'
	@echo

dev: codegen  ## Create dev environment
	$(call assert_file_exists, deploy/dev/oauth2-proxy.cfg)
	cd deploy/dev && docker compose -p $(DEV_PROJECT_NAME) up --build

dev-up: ## Docker compose up on the dev environment
	cd deploy/dev && docker compose -p $(DEV_PROJECT_NAME) up

dev-destroy: ## Destroy the dev environment
	cd deploy/dev &&  docker compose -p $(DEV_PROJECT_NAME) down

dev-psql: ## Get an interactive psql shell in dev
	docker exec -it ucl-arc-tre-portal-dev-postgres-1 psql --dbname=dev --user=postgres

codegen:  ## Run the code generation
	oapi-codegen -package openapi -generate "gin,types" api.web.yaml > "internal/openapi/web/main.gen.go"
	cd web && npm run openapi-ts

test:  ## Run all tests
	$(MAKE) test-unit
	$(MAKE) test-e2e

test-unit:  ## Run unit tests
	go test ./...

test-e2e-dev: e2e-dependencies  ## Run Cypress locally against dockerised dev server
	if ! docker compose -p $(DEV_PROJECT_NAME) ps --services --filter "status=running" | grep nginx; then \
		echo "dev environment not running"; exit 1; \
	fi
	cd web && CYPRESS_baseUrl=http://localhost:8000 npx cypress run --headless --browser chrome

test-e2e-release: e2e-dependencies ## Run cypress against the release build
	cd e2e && \
	docker compose -p $(E2E_PROJECT_NAME) build && \
	docker compose -p $(E2E_PROJECT_NAME) run --rm cypress && \
	docker compose -p $(E2E_PROJECT_NAME) down --remove-orphans

e2e-dependencies:
	$(call assert_file_exists, e2e/oauth2-proxy.cfg)

web-lint: ## Lint frontend web things
	cd web && npm run lint

web-format:
	cd web && npx prettier --write .

.SILENT: e2e-dependencies
