import 'regenerator-runtime/runtime' // needed by the SSR to be able to execute transpiled generator functions like async/await
import { call, pipe }  from 'ramda'
import createConfiguration from './configuration'
import createLogger from './logger'
import createQueue from './queue'
import initManager from './manager'
import initWorker from './worker'
import setupProcessHandlers from './processHandlers'

const configuration = createConfiguration()

const logger = createLogger(configuration.log.level, console)

const queue = createQueue(configuration.queue.redis_dsn)

// main :: (Configuration, Logger, Queue) => _
const main = (configuration, logger, queue) => call(pipe(
  () => configuration.manager.enabled && initManager(configuration, logger, queue),
  () => configuration.worker.enabled && initWorker(configuration, logger, queue),
  () => setupProcessHandlers(logger),
))

main(configuration, logger, queue)
