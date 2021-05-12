IMAGE_NAME = knplabs/server-side-renderer

.PHONY: build
build: .validate-tag
	docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

.PHONY: build
push: .validate-tag
	docker push ${IMAGE_NAME}:${IMAGE_TAG}

.PHONY: .validate-tag
.validate-tag:
ifeq ($(IMAGE_TAG),)
	@echo "You can't build and push without an IMAGE_TAG.\n"
	@exit 1
endif

.PHONY: lint
lint: ## Run eslint locally
	docker-compose run --rm chromium_pool yarn lint --fix
