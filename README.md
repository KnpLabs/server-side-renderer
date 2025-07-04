Server-side-renderer
======================================================

| Branch    | Status | Release | Licence |
| --------- | ------ | ------- | ------- |
| `master`  | [![CircleCI](https://dl.circleci.com/status-badge/img/gh/KnpLabs/server-side-renderer/tree/master.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/KnpLabs/server-side-renderer/tree/master) | ![GitHub release (latest by date)](https://img.shields.io/github/v/release/knplabs/server-side-renderer) | ![GitHub](https://img.shields.io/github/license/knplabs/server-side-renderer)

## Description

Docker image to server side render dynamic html pages using a browser.

This service exposes a web-service that lets you request the dynamic html
pages rendering. Html pages are rendered using a headless browser (at the
moment only Chrome is supported).

This service is scalable and you can add as many replicas as you want in order
to support a high number of requests. Every replica manages one request at a
time and, if all the replicas are busy the following requests will be queued
and processed sequentially.

Every replica can be configured to be a manager, a worker or both (see the
[configuration](#configuration) section to find out how to configure them).

> We strongly recommend to configure a cache layer on top of this component to
avoid re-generating the same resource multiple times (except if not
specifically needed).

### Manager

Managers are responsible to expose the web-service to let other services
request page renderings. They are adding requests to the Redis queue and
waiting for them to complete before returning the response to the client.

### Workers

Workers are responsible to render requested pages regularly polling for
available jobs in the Redis queue.

## Requirements

1. Docker >= v19.03
2. Docker compose >= 1.19.0
3. Redis

## How to use it

### Basic usage

Run:

```bash
docker run --name my-server-side-renderer -e "QUEUE_REDIS_DSN=redis://my-redis-host:6379" -p 80:8080 -d knplabs/server-side-renderer
```

After that you should be able to access the service via `http://localhost/render?url=https://your-website.com/your-dynamic-page`.

### Docker compose usage

Create a `docker-compose.yaml` file with the following content:

```yaml
version: '3.8'

services:
  manager:
    image: knplabs/server-side-renderer
    depends_on:
      - redis
    environment:
      - QUEUE_REDIS_DSN=redis://redis:6379
    ports:
      - "80:8080"

  redis:
    image: redis:6.2.2-buster
```

Run:

```bash
docker-compose -f docker-compose.yaml up -d
```

After that you should be able to access the service via `http://localhost/render?url=https://your-website.com/your-dynamic-page`.

### Scaling

If you have to deal with lots of requests, you can add more processing power by
scaling the worker nodes.

To achieve that you have to configure a manager service who's only purpose is
to manage the rendering requests and a worker service who's purpose is to
actually render the html page.

In order to do that follow the steps described below.

Create a `docker-compose.yaml` file with the following content:

```yaml
version: '3.8'

services:
  manager:
    image: knplabs/server-side-renderer
    depends_on:
      - redis
    environment:
      - QUEUE_REDIS_DSN=redis://redis:6379
      - MANAGER_ENABLED=1
      - WORKER_ENABLED=0
    ports:
      - "80:8080"

  worker:
    image: knplabs/server-side-renderer
    depends_on:
      - redis
    environment:
      - QUEUE_REDIS_DSN=redis://redis:6379
      - MANAGER_ENABLED=0
      - WORKER_ENABLED=1
    ports:
      - "80:8080"

  redis:
    image: redis:6.2.2-buster
```

Run:

```bash
docker-compose -f docker-compose.yaml up -d
```

After that you should be able to access the service via `http://localhost/render?url=https://your-website.com/your-dynamic-page`.

Scale the worker service replicas by running:

```bash
docker-compose -f docker-compose.yaml scale worker=<number-of-replicas>
```

The `<number-of-replicas>` represents an integer defining the number of service
replicas you want to run (the total number of replicas not the ones you want to
add). Keep in mind that the number of replicas you start represents the number
of requests that can be simultaneously handled by the renderer. All requests
exceeding that number wiull be queued and handled once there will be free
workers.

## Configuration

Service configuration is entirely done via environment variables.

| Environment variable                           | Mandatory | Description                                                                                                  |
| ---------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------ |
| `LOG_LEVEL`                                    |           | Sets the log level. Accepted values are `DEBUG`, `INFO`, `WARNING`, `ERROR`. Default `INFO`.                 |
|                                                |           |                                                                                                              |
| `QUEUE_REDIS_DSN`                              |     *     | Redis queue DSN.                                                                                             |
| `QUEUE_JOB_STALE_TIMEOUT`                      |           | Defines how many milliseconds a job can stay in the queue without being picked by a worker. Default `10000`. |
| `QUEUE_JOB_TIMEOUT`                            |           | Defines how many milliseconds a job can take to complete after being picked by a worker. Default `30000`.    |
|                                                |           |                                                                                                              |
| `MANAGER_ENABLED`                              |           | Enables or disables the manager role. Accepted values are `0` (false) and `1` (true). Default `1`.           |
| `MANAGER_HTTP_SERVER_HOST`                     |           | Manager's web-server host. Default `0.0.0.0`.                                                                |
| `MANAGER_HTTP_SERVER_PORT`                     |           | Manager's web-server port. Default `8080`.                                                                   |
|                                                |           |                                                                                                              |
| `WORKER_ENABLED`                               |           | Enables or disables the worker role. Accepted values are `0` (false) and `1` (true). Default `1`.            |
| `WORKER_RENDERER_TIMEOUT`                      |           | Defines how many milliseconds the browser can take to render the requested page. Default 20000.              |
| `WORKER_RENDERER_AUTHORIZED_REQUEST_DOMAINS`   |           | Defines a comma separated list of renderer's authorized request domains. This feature can be used to block some unwanted requests (for security or for performance reason) made by the dynamic html page you requested to render (wildcards are supported). Default `*` which means that all domains are allowed. |
| `WORKER_RENDERER_AUTHORIZED_REQUEST_RESOURCES` |           | Defines a comma separated list of renderer's authorized request resource types. Accepted values are `document`, `stylesheet`, `image`, `media`, `font`, `script`, `texttrack`, `xhr`, `fetch`, `eventsource`, `websocket`, `manifest`, `other`. Default `*` which means that all resource types are allowed. |
| `WORKER_RENDERER_CHROME_OPTIONS`               |           | Defines a comma separated list of Chrome renderer's options (coma separated). Accepted values are listed [here](https://peter.sh/experiments/chromium-command-line-switches). Default `--disable-dev-shm-usage, --disable-gpu, --disable-setuid-sandbox, --disable-software-rasterizer, --headless, --no-sandbox, --safebrowsing-disable-auto-update, --use-gl=disabled`. |

You also have the possibility to run a post render script which is executed by the browser instance after the page has finished rendering and before returning the html content to the client.
In order to do so you can just override the default [post render script](/scripts/postRender.js) placed in the container's `/app/scripts` folder (see [docker-compose.test.js](/docker-compose.test.js) as an example).

## Setup a local environment

There is a `.env.dist` at the root directory that can be clone into `.env`.
It's up to you to edit these env vars according to your local environment.

**Note**: the `make dev` command will copy the `.env.dist` file into `.env` if it does not exist.

### Start the local environment

```sh
$ make dev
```

This command will build and start the docker containers and update dependencies.

### Run tests

```sh
$ make test
```

This command will run unit and end to end tests.

## Available make targets

| Command              | Description                                                                          |
| -------------------- | -------------------------------------------------------------------------------------|
| `dev`                | Builds and starts the stack (Combination of `cp-env`, `start`, `install-deps`)       |
| `cp-env`             | Copies the `.env.dist` file into `.env` if it does not exist                         |
| `start`              | Starts the docker-compose stack                                                      |
| `stop`               | Stops the docker-compose stack                                                       |
| `install-deps`       | Installs front dependencies                                                          |
|                      |                                                                                      |
| `test`               | Runs the tests (unit + end to end)                                                   |
|                      |                                                                                      |
| `lint-dockerfiles`   | Runs the Dockerfile's linter                                                         |
| `lint-js`            | Runs the JavaScript's linter                                                         |
| `fix-js`             | Fixes JavaScript code styles issues                                                  |
|                      |                                                                                      |
| `build`              | Builds the Docker image (image tag required)                                         |
| `push`               | Pushes the Docker image on DockerHub (image tag required)                            |
| `push-latest`        | Pushes the Docker image with latest tag (image tag required)                         |

## Maintainers

Everyone is welcome to contribute to this repository. Please be sure to check
the [contributing guidelines](https://github.com/KnpLabs/server-side-renderer/blob/master/CONTRIBUTING.md)
before opening an issue or a pull request.

The following people maintain and can merge into this library:
 - [@hlegay](https://github.com/hlegay)
 - [@lcouellan](https://github.com/lcouellan)
