import 'regenerator-runtime/runtime' // needed by the SSR to be able to execute transpiled generator functions like async/await
import { call, equals, pipe }  from 'ramda'
import { default as createLogger, DEFAULT_LEVEL } from './logger'
import setupProcessHandlers from './processHandlers'
import createQueue from './queue'
import initManager from './manager'
import initWorker from './worker'

const logger = createLogger(process.env.LOG_LEVEL || DEFAULT_LEVEL, console)

const queue = createQueue(process.env.QUEUE_REDIS_DSN)

const shouldStartManager = () => equals(1, Number(process.env.MANAGER_ENABLED))

const shouldStartWorker = () => equals(1, Number(process.env.WORKER_ENABLED))

// main :: (Logger, Queue) => _
const main = (logger, queue) => call(pipe(
    () => shouldStartManager() && initManager(logger, queue),
    () => shouldStartWorker() && initWorker(logger, queue),
    () => setupProcessHandlers(logger),
))

main(logger, queue)
