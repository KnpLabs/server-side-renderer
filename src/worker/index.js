import { call, pipe } from 'ramda';
import render from './renderers/chromeRenderer'

export default (logger, queue) => call(pipe(
    () => logger.info('Initializing worker.'),
    () => queue.process(async job => {
        logger.info(`Processing job "${job.id}" with url "${job.data.url}".`)

        return await render(logger)(job.data.url)
    }),
    () => logger.info('Worker initialized.'),
))
