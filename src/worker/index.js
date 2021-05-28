import { call, pipe } from 'ramda'
import TimeoutError from '../error/TimeoutError'
import render from './renderers/chrome'

// initWorker :: (Configuration, Logger, Queue) -> _
export default (configuration, logger, queue) => call(pipe(
  () => logger.info('Initializing worker.'),
  () => queue.process(1, async job => {
    if ((new Date()).getTime() - job.queuedAt > configuration.queue.job.stale_timeout) {
      throw new TimeoutError(`Job "${job.id}" with url "${job.data.url}" timed out."`)
    }

    logger.info(`Processing job "${job.id}" with url "${job.data.url}".`)

    return await render(configuration, logger)(job.data.url)
  }),
  () => logger.info('Worker initialized.'),
))
