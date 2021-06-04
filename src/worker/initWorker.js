import { call, pipe, tap } from 'ramda'
import queueProcessHandler from './queue/processHandler'

// initWorker :: (Configuration, Logger, Queue) -> Function
export default (configuration, logger, queue) => call(pipe(
  tap(() => logger.debug('Initializing worker.')),
  tap(() => queue.process(1, queueProcessHandler(configuration, logger))),
  tap(() => logger.debug('Worker initialized.')),
  // Returns a function to be used to gracefully shutdown the worker
  () => async () => {
    logger.debug('Gracefully shutting down worker')

    await queue.close()
  },
))
