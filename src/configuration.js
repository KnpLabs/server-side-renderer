import { LEVEL_INFO, levels as validLogLevels } from './logger'
import {
  T,
  __,
  allPass,
  anyPass,
  complement,
  compose,
  filter,
  includes,
  isEmpty,
  isNil,
  map,
  path,
  pipe,
  split,
  trim,
  unless,
} from 'ramda'

// isLogConfigurationValid :: Configuration -> Boolean
const isLogConfigurationValid = compose(includes(__, validLogLevels), path(['log', 'level']))

// isQueueConfigurationValid :: Configuration -> Boolean
const isQueueConfigurationValid = compose(complement(isEmpty), path(['queue', 'redis_dsn']))

// isManagerConfigurationValid :: Configuration -> Boolean
const isManagerConfigurationValid = T

// isWorkerConfigurationValid :: Configuration -> Boolean
const isWorkerConfigurationValid = T

// validate :: Configuration -> Boolean
const validate = allPass([
  isLogConfigurationValid,
  isQueueConfigurationValid,
  isManagerConfigurationValid,
  isWorkerConfigurationValid,
])

// commaSeparatedStringToArray :: String -> String[]
const commaSeparatedStringToArray = pipe(
  split(','),
  map(trim),
  filter(complement(anyPass([isNil, isEmpty]))),
)

// generate :: _ -> Configuration
const generate = () => ({
  log: {
    level: process.env.LOG_LEVEL || LEVEL_INFO,
  },
  queue: {
    redis_dsn: process.env.QUEUE_REDIS_DSN,
  },
  manager: {
    enabled: 1 === Number(process.env.MANAGER_ENABLED),
    http_server: {
      host: process.env.MANAGER_HTTP_SERVER_HOST || '0.0.0.0',
      port: Number(process.env.MANAGER_HTTP_SERVER_PORT) || 8080,
    },
  },
  worker: {
    enabled: 1 === Number(process.env.WORKER_ENABLED),
    renderer: {
      authorized_request_domains: commaSeparatedStringToArray(
        process.env.WORKER_RENDERER_AUTHORIZED_REQUEST_DOMAINS || '*',
      ),
      authorized_request_resources: commaSeparatedStringToArray(
        process.env.WORKER_RENDERER_AUTHORIZED_REQUEST_RESOURCES || '*',
      ),
      domain_redirections: commaSeparatedStringToArray(
        process.env.WORKER_RENDERER_REDIRECTED_DOMAINS || '',
      ),
    },
  },
})

// createConfiguration :: _ -> Configuration
export default pipe(
  generate,
  unless(validate, () => { throw new Error('Invalid configuration.') }),
)
