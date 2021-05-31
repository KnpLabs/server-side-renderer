import { call, pipe } from 'ramda'
import render from './renderers/chrome'

// initWorker :: (Configuration, Logger, Queue) -> _
export default (configuration, logger, queue) => call(pipe(
  () => logger.debug('Initializing worker.'),
  () => queue.process(1, async job => {
    if ((new Date()).getTime() - job.data.queuedAt > configuration.queue.job.stale_timeout) {
      throw new Error(`Job "${job.id}" with url "${job.data.url}" timed out."`)
    }

    logger.debug(`Processing job "${job.id}" with url "${job.data.url}".`)

    return await render(configuration, logger)(job.data.url)
  }),
  () => logger.debug('Worker initialized.'),
))
