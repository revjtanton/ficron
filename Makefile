help: ## show help message
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m\033[0m\n"} /^[$$()% a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

start: ## start only the app in a local docker instance
	@COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose up --build -d

stop: ## stop the local docker instance
	@docker-compose down

stop-clean: ## stops the local docker instance and removes local images and volumes
	@docker-compose down --remove-orphans -v && rm -Rf .db

lint: ## lints the code itself THIS WILL PREVENT COMMIT ON FAILURE
	@yarn lint

lint-spec: ## lints the API spec THIS WILL PREVENT COMMIT ON FAILURE
	@yarn lint-spec

test: ## runs the unit tests
	@yarn tests
