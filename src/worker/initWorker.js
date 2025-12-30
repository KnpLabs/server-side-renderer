import createScriptProvider from './scriptProvider'
import queueProcessHandler from './queue/processHandler'

export default (configuration, logger, queue) => {
  logger.debug('Initializing worker.')
  const scriptProvider = createScriptProvider()
  queue.process(1, queueProcessHandler(configuration, logger, scriptProvider))
  logger.debug('Worker initialized.')

  return async () => {
    logger.debug('Gracefully shutting down worker')
    await queue.close()
  }
}
