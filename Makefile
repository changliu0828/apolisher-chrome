# Thin wrappers around the npm scripts in package.json.
# `make` on its own lists the targets.

.DEFAULT_GOAL := help
.PHONY: help install dev build test test-watch coverage lint lint-fix type-check check package clean

VERSION := $(shell node -p "require('./package.json').version")

help: ## List available targets
	@grep -hE '^[a-z-]+:.*?## ' $(MAKEFILE_LIST) | awk -F':.*?## ' '{printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start the dev build with HMR (writes dist/, reload in chrome://extensions)
	npm run dev

build: ## Production build into dist/
	npm run build

test: ## Run the unit tests once
	npm run test:run

test-watch: ## Run the unit tests in watch mode
	npm run test

coverage: ## Run the unit tests with a coverage report
	npm run test:coverage

lint: ## Check for lint errors
	npm run lint

lint-fix: ## Fix what the linter can fix
	npm run lint:fix

type-check: ## Type-check without emitting
	npm run type-check

check: type-check lint test ## Everything the pre-commit and CI gates care about

package: check ## Build and zip dist/ for the Chrome Web Store
	npm run package
	@echo "Upload release/apolisher-chrome-v$(VERSION).zip to the Web Store dashboard"

clean: ## Remove build output and packaged zips
	rm -rf dist release
