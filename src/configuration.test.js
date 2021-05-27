import createConfiguration from './configuration'

const ORIGINAL_ENV = process.env

beforeEach(() => {
  jest.resetModules() // Most important - it clears the cache
  process.env = { ...ORIGINAL_ENV } // Make a copy
})

afterAll(() => {
  process.env = ORIGINAL_ENV // Restore old environment
})

describe('configuration :: createConfiguration', () => {
  it(`creates a configuration with default values`, () => {
    process.env.QUEUE_REDIS_DSN = 'redis://redis:6379'

    expect(createConfiguration()).toStrictEqual({
      log: {
        level: 'INFO',
      },
      manager: {
        enabled: true,
        http_server: {
          host: '0.0.0.0',
          port: 8080,
        },
      },
      queue: {
        redis_dsn: 'redis://redis:6379',
        job: {
          timeout: 30000,
        },
      },
      worker: {
        enabled: true,
        renderer: {
          authorized_request_domains: [
            '*',
          ],
          authorized_request_resources: [
            '*',
          ],
          domain_redirections: [],
        },
      },
    })
  })

  it(`creates a configuration with a manager disabled`, () => {
    process.env.QUEUE_REDIS_DSN = 'redis://redis:6379'
    process.env.MANAGER_ENABLED = 0

    expect(createConfiguration()).toStrictEqual({
      log: {
        level: 'INFO',
      },
      manager: {
        enabled: false,
        http_server: {
          host: '0.0.0.0',
          port: 8080,
        },
      },
      queue: {
        redis_dsn: 'redis://redis:6379',
        job: {
          timeout: 30000,
        },
      },
      worker: {
        enabled: true,
        renderer: {
          authorized_request_domains: [
            '*',
          ],
          authorized_request_resources: [
            '*',
          ],
          domain_redirections: [],
        },
      },
    })
  })

  it(`creates a configuration with a worker disabled`, () => {
    process.env.QUEUE_REDIS_DSN = 'redis://redis:6379'
    process.env.WORKER_ENABLED = 0

    expect(createConfiguration()).toStrictEqual({
      log: {
        level: 'INFO',
      },
      manager: {
        enabled: true,
        http_server: {
          host: '0.0.0.0',
          port: 8080,
        },
      },
      queue: {
        redis_dsn: 'redis://redis:6379',
        job: {
          timeout: 30000,
        },
      },
      worker: {
        enabled: false,
        renderer: {
          authorized_request_domains: [
            '*',
          ],
          authorized_request_resources: [
            '*',
          ],
          domain_redirections: [],
        },
      },
    })
  })

  it(`creates a configuration`, () => {
    process.env.LOG_LEVEL = 'ERROR'
    process.env.QUEUE_REDIS_DSN = 'redis://redis:6379'
    process.env.QUEUE_JOB_TIMEOUT = 5000
    process.env.MANAGER_ENABLED = 1
    process.env.MANAGER_HTTP_SERVER_PORT = 8081
    process.env.MANAGER_HTTP_SERVER_HOST = '127.0.0.1'
    process.env.WORKER_ENABLED = 1
    process.env.WORKER_RENDERER_AUTHORIZED_REQUEST_DOMAINS = 'localhost, nginx'
    process.env.WORKER_RENDERER_AUTHORIZED_REQUEST_RESOURCES = 'document, script'
    process.env.WORKER_RENDERER_REDIRECTED_DOMAINS = 'example.com|nginx'

    expect(createConfiguration()).toStrictEqual({
      log: {
        level: 'ERROR',
      },
      manager: {
        enabled: true,
        http_server: {
          host: '127.0.0.1',
          port: 8081,
        },
      },
      queue: {
        redis_dsn: 'redis://redis:6379',
        job: {
          timeout: 5000,
        },
      },
      worker: {
        enabled: true,
        renderer: {
          authorized_request_domains: [
            'localhost',
            'nginx',
          ],
          authorized_request_resources: [
            'document',
            'script',
          ],
          domain_redirections: [{
            from: 'example.com',
            to: 'nginx',
          }],
        },
      },
    })
  })

  it(`throws an exception when the log configuration is invalid`, () => {
    process.env.QUEUE_REDIS_DSN = 'redis://redis:6379'
    process.env.LOG_LEVEL = 'invalid'

    expect(() => createConfiguration()).toThrow('Invalid configuration.')
  })

  it(`throws an exception when the queue configuration is invalid`, () => {
    expect(() => createConfiguration()).toThrow('Invalid configuration.')
  })

  it(`throws an exception when the worker configuration is invalid`, () => {
    process.env.QUEUE_REDIS_DSN = 'redis://redis:6379'
    process.env.WORKER_RENDERER_REDIRECTED_DOMAINS = 'example.com|'

    expect(() => createConfiguration()).toThrow('Invalid configuration.')
  })
})
