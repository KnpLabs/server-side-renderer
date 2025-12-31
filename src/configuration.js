import { LEVEL_INFO, levels as validLogLevels } from './logger'
import {
  T,
  __,
  allPass,
  anyPass,
  both,
  complement,
  compose,
  equals,
  filter,
  includes,
  isEmpty,
  isNil,
  join,
  map,
  path,
  pipe,
  reduce,
  split,
  trim,
  unless,
} from 'ramda'

const DEFAULT_WORKER_RENDERER_CHROME_OPTIONS = [
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--disable-setuid-sandbox',
  '--disable-software-rasterizer',
  '--headless',
  '--no-sandbox',
  '--safebrowsing-disable-auto-update',
  '--use-gl=disabled',
]

const isDefined = both(complement(isNil), complement(isEmpty))

const isLogConfigurationValid = compose(includes(__, validLogLevels), path(['log', 'level']))

const isQueueConfigurationValid = compose(isDefined, path(['queue', 'redis_dsn']))

const isManagerConfigurationValid = T

const isWorkerConfigurationValid = pipe(
  path(['worker', 'renderer', 'redirections']),
  reduce(
    (acc, { from, to }) => unless(
      equals(false),
      allPass([
        () => isDefined(from),
        () => isDefined(to),
      ]),
    )(acc),
    true,
  ),
)

const validate = allPass([
  isLogConfigurationValid,
  isQueueConfigurationValid,
  isManagerConfigurationValid,
  isWorkerConfigurationValid,
])

const stringToArray = separator => pipe(
  split(separator),
  map(trim),
  filter(complement(anyPass([isNil, isEmpty]))),
)

const commaSeparatedStringToArray = stringToArray(',')

const pipeSeparatedStringToArray = stringToArray('|')

const generate = () => ({
  log: {
    level: process.env.LOG_LEVEL ?? LEVEL_INFO,
  },
  queue: {
    redis_dsn: process.env.QUEUE_REDIS_DSN,
    job: {
      stale_timeout: Number(process.env.QUEUE_JOB_STALE_TIMEOUT ?? 10000),
      timeout: Number(process.env.QUEUE_JOB_TIMEOUT ?? 30000),
    },
  },
  manager: {
    enabled: 1 === Number(process.env.MANAGER_ENABLED ?? 1),
    http_server: {
      host: process.env.MANAGER_HTTP_SERVER_HOST ?? '0.0.0.0',
      port: Number(process.env.MANAGER_HTTP_SERVER_PORT ?? 8080),
    },
  },
  worker: {
    enabled: 1 === Number(process.env.WORKER_ENABLED ?? 1),
    renderer: {
      timeout: Number(process.env.WORKER_RENDERER_TIMEOUT ?? 20000),
      authorized_request_domains: commaSeparatedStringToArray(
        process.env.WORKER_RENDERER_AUTHORIZED_REQUEST_DOMAINS ?? '*',
      ),
      authorized_request_resources: commaSeparatedStringToArray(
        process.env.WORKER_RENDERER_AUTHORIZED_REQUEST_RESOURCES ?? '*',
      ),
      redirections: pipe(
        commaSeparatedStringToArray,
        map(pipeSeparatedStringToArray),
        map(([from, to]) => ({ from, to })),
      )(process.env.WORKER_RENDERER_REDIRECTIONS ?? ''),
      chrome: {
        options: commaSeparatedStringToArray(
          process.env.WORKER_RENDERER_CHROME_OPTIONS
          ?? join(',', DEFAULT_WORKER_RENDERER_CHROME_OPTIONS),
        ),
      },
    },
  },
})

export default pipe(
  generate,
  unless(validate, () => { throw new Error('Invalid configuration.') }),
)
