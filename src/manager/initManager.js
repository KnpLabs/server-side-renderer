import { call, pipe, tap } from 'ramda'
import createRequestRegistry from './requestRegistry'
import initHttpServer from './http-server'
import queueJobCompletedHandler from './queue/jobCompletedHandler'
import queueJobFailedHandler from './queue/jobFailedHandler'

// initManager :: (Configuration, Logger, Queue) -> Function
export default (configuration, logger, queue) => call(pipe(
  tap(() => logger.debug('Initializing manager.')),
  () => createRequestRegistry(),
  tap(requestRegistry => queue.on('global:completed', queueJobCompletedHandler(logger, queue, requestRegistry))),
  tap(requestRegistry => queue.on('global:failed', queueJobFailedHandler(logger, queue, requestRegistry))),
  requestRegistry => initHttpServer(configuration, logger, queue, requestRegistry),
  tap(() => logger.debug('Manager initialized.')),
  // Returns a function to be used to gracefully shutdown the manager
  httpServer => async () => {
    logger.debug('Gracefully shutting down manager')

    await queue.close()
    await httpServer.close()
  },
))
