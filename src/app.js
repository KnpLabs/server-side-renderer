import initManager from './manager'
import initWorker from './worker'
import setupProcessHandlers from './processHandlers'

export default (configuration, logger, queue) => {
  const shutdownManager = configuration.manager.enabled
    ? initManager(configuration, logger, queue)
    : async () => {}

  const shutdownWorker = configuration.worker.enabled
    ? initWorker(configuration, logger, queue)
    : async () => {}

  const shutdownFunction = async () => {
    await shutdownWorker()
    await shutdownManager()
  }

  return setupProcessHandlers(logger, shutdownFunction)
}
