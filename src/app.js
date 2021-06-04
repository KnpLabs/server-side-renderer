import { call, ifElse, juxt, pipe }  from 'ramda'
import initManager from './manager'
import initWorker from './worker'
import setupProcessHandlers from './processHandlers'

// initApp :: (Configuration, Logger, Queue) => _
export default (configuration, logger, queue) => call(pipe(
  juxt([
    ifElse(
      () => configuration.manager.enabled,
      () => initManager(configuration, logger, queue),
      () => () => {}, // Empty graceful shutdown function
    ),
    ifElse(
      () => configuration.worker.enabled,
      () => initWorker(configuration, logger, queue),
      () => () => {}, // Empty graceful shutdown function
    ),
  ]),
  ([ shutdownManager, shutdownWorker ]) => async () => {
    await shutdownWorker()
    await shutdownManager()
  },
  shutdownFunction => setupProcessHandlers(logger, shutdownFunction),
))
