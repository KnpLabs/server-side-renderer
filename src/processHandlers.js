import { formatException } from './logger'
import { pipe } from 'ramda'

// onUncaughtException :: Logger -> Error -> void
const onUncaughtException = logger => pipe(
  error => logger.error(
    'An exception has been thrown but not properly caught. Exiting...',
    formatException(error),
  ),
  () => process.exit(1),
)

// setUpUncaughtExceptionHandler :: Logger -> void
const setUpUncaughtExceptionHandler = logger =>
  process.on('uncaughtException', onUncaughtException(logger))

// onUnhandledRejection :: Logger -> Error -> void
const onUnhandledRejection = logger => error =>
  logger.error(
    'A promise has been rejected without being properly handled.',
    formatException(error),
  )

// setUpUnhandledRejectionHandler :: Logger -> void
const setUpUnhandledRejectionHandler = logger =>
  process.on('unhandledRejection', onUnhandledRejection(logger))

// performGracefulShutdown :: (Logger, Function) -> void
const performGracefulShutdown = async (logger, shutdownFunction) => {
  logger.info(`Graceful shutdown started.`)

  await shutdownFunction()
  process.exit(0)
}

// onTerminationSignal :: (Logger, Function, String) -> void
export const onTerminationSignal = (logger, shutdownFunction, signal) => pipe(
  () => logger.info(`${signal} received.`),
  () => performGracefulShutdown(logger, shutdownFunction),
)

// setUpOnSIGINTHandler :: (Logger, Function) -> void
// SIGINT signal is sent if you run the application from your terminal and you
// hit ctrl+c
const setUpOnSIGINTHandler = (logger, shutdownFunction) =>
  process.on('SIGINT', onTerminationSignal(logger, shutdownFunction, 'SIGINT'))

// setUpOnSIGTERMHandler :: (Logger, Function) -> void
// SIGTERM signal is sent by Docker when the container has been requested to
// stop (stop, upgrade, etc...). If after x seconds the container doesn't stop
// a SIGKILL signal is sent and the container immediately stop.
const setUpOnSIGTERMHandler = (logger, shutdownFunction) =>
  process.on('SIGTERM', onTerminationSignal(logger, shutdownFunction, 'SIGTERM'))

// setupProcessHandlers :: (Logger, Function) -> void
export default (logger, shutdownFunction) => {
  setUpUncaughtExceptionHandler(logger)
  setUpUnhandledRejectionHandler(logger)
  setUpOnSIGINTHandler(logger, shutdownFunction)
  setUpOnSIGTERMHandler(logger, shutdownFunction)
}
