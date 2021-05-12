import { call, pipe } from 'ramda';
import render from './renderers/chromeRenderer'

// initWorker :: (Configuration, Logger, Queue) -> _
export default (configuration, logger, queue) => call(pipe(
    () => logger.info('Initializing worker.'),
    () => queue.process(async job => {
        logger.info(`Processing job "${job.id}" with url "${job.data.url}".`)

        return await render(configuration, logger)(job.data.url)
    }),
    () => logger.info('Worker initialized.'),
))
