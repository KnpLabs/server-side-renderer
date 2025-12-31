import { formatException } from './logger'

const onUncaughtException = logger => error => {
  logger.error(
    'An exception has been thrown but not properly caught. Exiting...',
    formatException(error),
  )
  process.exit(1)
}

const setUpUncaughtExceptionHandler = logger =>
  process.on('uncaughtException', onUncaughtException(logger))

const onUnhandledRejection = logger => error =>
  logger.error(
    'A promise has been rejected without being properly handled.',
    formatException(error),
  )

const setUpUnhandledRejectionHandler = logger =>
  process.on('unhandledRejection', onUnhandledRejection(logger))

const performGracefulShutdown = async (logger, shutdownFunction) => {
  logger.info(`Graceful shutdown started.`)

  await shutdownFunction()
  process.exit(0)
}

export const onTerminationSignal = (logger, shutdownFunction, signal) => () => {
  logger.info(`${signal} received.`)
  performGracefulShutdown(logger, shutdownFunction)
}

// SIGINT signal is sent if you run the application from your terminal and you
// hit ctrl+c
const setUpOnSIGINTHandler = (logger, shutdownFunction) =>
  process.on('SIGINT', onTerminationSignal(logger, shutdownFunction, 'SIGINT'))

// SIGTERM signal is sent by Docker when the container has been requested to
// stop (stop, upgrade, etc...). If after x seconds the container doesn't stop
// a SIGKILL signal is sent and the container immediately stop.
const setUpOnSIGTERMHandler = (logger, shutdownFunction) =>
  process.on('SIGTERM', onTerminationSignal(logger, shutdownFunction, 'SIGTERM'))

export default (logger, shutdownFunction) => {
  setUpUncaughtExceptionHandler(logger)
  setUpUnhandledRejectionHandler(logger)
  setUpOnSIGINTHandler(logger, shutdownFunction)
  setUpOnSIGTERMHandler(logger, shutdownFunction)
}
