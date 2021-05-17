import { call, pipe } from 'ramda'
import { formatException } from './logger'

// onUncaughtException :: Logger -> Error -> void
export const onUncaughtException = logger => pipe(
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
export const onUnhandledRejection = logger => error =>
  logger.error(
    'A promise has been rejected without being properly handled.',
    formatException(error),
  )

// setUpUnhandledRejectionHandler :: Logger -> void
const setUpUnhandledRejectionHandler = logger =>
  process.on('unhandledRejection', onUnhandledRejection(logger))

// performGracefulShutdown :: Logger -> void
const performGracefulShutdown = logger => call(pipe(
  () => logger.info(`Graceful shutdown started.`),
  () => process.exit(0),
))

// onTerminationSignal :: Logger-> void
export const onTerminationSignal = (logger, signal) => pipe(
  () => logger.info(`${signal} received.`),
  () => performGracefulShutdown(logger),
)

// setUpOnSIGINTHandler :: Logger -> void
// SIGINT signal is sent if you run the application from your terminal and you
// hit ctrl+c
const setUpOnSIGINTHandler = logger =>
  process.on('SIGINT', onTerminationSignal(logger, 'SIGINT'))

// setUpOnSIGTERMHandler :: Logger-> void
// SIGTERM signal is sent by Docker when the container has been requested to
// stop (stop, upgrade, etc...). If after x seconds the container doesn't stop
// a SIGKILL signal is sent and the container immediately stop.
const setUpOnSIGTERMHandler = logger =>
  process.on('SIGTERM', onTerminationSignal(logger, 'SIGTERM'))

// setupProcessHandlers :: Logger -> void
export default logger => {
  setUpUncaughtExceptionHandler(logger)
  setUpUnhandledRejectionHandler(logger)
  setUpOnSIGINTHandler(logger)
  setUpOnSIGTERMHandler(logger)
}
