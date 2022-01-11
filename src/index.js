import createConfiguration from './configuration'
import createLogger from './logger'
import createQueue from './queue'
import initApp from './app'

const configuration = createConfiguration()

const logger = createLogger(configuration.log.level, console)

const queue = createQueue(configuration.queue.redis_dsn)

initApp(configuration, logger, queue)
