STAGE ?= dev
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
push: .validate-tag
	docker push ${IMAGE_NAME}:${IMAGE_TAG}

.PHONY: .cp-env
.cp-env:
ifeq ($(STAGE),dev)
	cp -n .env.dev.dist .env
endif

.PHONY: .install-deps
.install-deps:
ifeq ($(STAGE),dev)
	docker-compose -f docker-compose.dev.yaml run --rm app yarn install
else
	@echo "You can't install app dependencies on non-dev environments.\n"
	@exit 1
endif

.PHONY: .validate-tag
.validate-tag:
ifeq ($(IMAGE_TAG),)
	@echo "You can't build and push without an IMAGE_TAG.\n"
	@exit 1
endif
