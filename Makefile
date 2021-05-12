STAGE ?= dev
FORCE_PUSH_OVERRIDE ?= 0
IMAGE_NAME = knplabs/server-side-renderer

.PHONY: start
start: .cp-env
	docker-compose -f docker-compose.${STAGE}.yaml build
	docker-compose -f docker-compose.${STAGE}.yaml up -d
	$(MAKE) .install-deps

.PHONY: stop
stop:
	docker-compose -f docker-compose.${STAGE}.yaml stop

.PHONY: test
test:
	docker run --rm -v $(PWD):/app:ro --network host knplabs/server-side-renderer:${STAGE} yarn test

.PHONY: build
build: .validate-tag
	docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

.PHONY: push
push: .validate-tag .block-image-override
	docker image push ${IMAGE_NAME}:${IMAGE_TAG}

.PHONY: push-latest
push-latest: .validate-tag
	docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest
	docker image push ${IMAGE_NAME}:latest

.PHONY: .cp-env
.cp-env:
ifeq ($(STAGE),dev)
	cp -n .env.dev.dist .env
endif

.PHONY: .install-deps
.install-deps:
ifeq ($(STAGE),dev)
	docker-compose -f docker-compose.dev.yaml run --rm app yarn install
else ifneq ($(STAGE),test)
	@echo "You can't install app dependencies on non-dev environments.\n"
	@exit 1
endif

.PHONY: .validate-tag
.validate-tag:
ifeq ($(IMAGE_TAG),)
	@echo "You can't build and push without an IMAGE_TAG.\n"
	@exit 1
endif

.PHONY: .block-image-override
.block-image-override:
ifeq ($(FORCE_PUSH_OVERRIDE),0)
	@if $$(docker buildx imagetools inspect ${IMAGE_NAME}:${IMAGE_TAG} >/dev/null 2>&1); then \
		echo "Image ${IMAGE_NAME} with tag ${IMAGE_TAG} found on remote registry."; \
		exit 1; \
	fi;
endif
