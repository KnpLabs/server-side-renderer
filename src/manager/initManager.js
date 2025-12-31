import createRequestRegistry from './requestRegistry'
import initHttpServer from './http-server'
import queueJobCompletedHandler from './queue/jobCompletedHandler'
import queueJobFailedHandler from './queue/jobFailedHandler'

export default (configuration, logger, queue) => {
  logger.debug('Initializing manager.')
  const requestRegistry = createRequestRegistry()

  queue.on('global:completed', queueJobCompletedHandler(logger, queue, requestRegistry))
  queue.on('global:failed', queueJobFailedHandler(logger, queue, requestRegistry))

  const httpServer = initHttpServer(configuration, logger, queue, requestRegistry)
  logger.debug('Manager initialized.')

  return async () => {
    logger.debug('Gracefully shutting down manager')
    await queue.close()
    await httpServer.close()
  }
}
