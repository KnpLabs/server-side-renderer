Server-side-renderer
======================================================

| Branch    | Status |
|-----------|--------|
| `master`  | [![CircleCI](https://circleci.com/gh/KnpLabs/server-side-renderer/tree/master.svg?style=svg&circle-token=1feb6f789ade0c11ee8b87e90eadbe9e6778fcb7)](https://circleci.com/gh/KnpLabs/server-side-renderer/tree/master) |

## Description

Docker image to server side render html pages using a browser (supports SPAs)

## Requirements

1. docker >= v19.03
2. docker-compose >= 1.19.0

## Setup on local environment

There is a `.env.dist` at the root directory that can be clone into `.env`.
It's up to you to edit these env vars according to your local environment.

**Note**: the `make dev` command will copy the `.env.dist` file into `.env` if it does not exist.

### Installation

```sh
$ make dev
```

This command will build and start the docker containers and update dependencies.

## Make commands

| Command              | Description                                                                      |
| -------------------- | ---------------------------------------------------------------------------------|
| `dev`                | Build and start the stack (Combination of `cp-env`, `start`, `install-deps`)     |
| `cp-env`             | Copy the `.env.dist` file into `.env` if it does not exist                       |
| `start`              | Start the docker-compose stack                                                   |
| `stop`               | Stop the docker-compose stack                                                    |
| `install-deps`       | Install front dependencies                                                       |
| `build`              | Build docker image (image tag required)                                          |
| `push`               | Push docker image on DockerHub (image tag required)                              |
| `push-latest`        | Push docker image with latest tag (image tag required)                           |

## Make commands for run tests

| Command              | Description       |
| -------------------- | ------------------|
| `test`               | Run unit tests    |

## Make commands for run linter

| Command              | Description                    |
| -------------------- | -------------------------------|
| `lint`               | Run linter on the application  |

## Maintainers

Anyone can contribute to this repository (and it's warmly welcomed!). The following
people maintain and can merge into this library:

 - [@alexpozzi](https://github.com/alexpozzi)
 - [@hlegay](https://github.com/hlegay)
