import { call, complement, compose, ifElse, isNil, path, pipe } from 'ramda'
import { DEFAULT_JOB_OPTIONS } from '../../../queue'

// default :: (Logger, Queue, RequestRegistry) -> Express.app -> Express.app
export default (logger, queue, requestRegistry) => app =>
    app.get('/render', (req, res, next) => call(pipe(
        () => logger.info(`Render request for url "${req.query.url}" started.`),
        ifElse(
            () => compose(complement(isNil), path(['query', 'url']))(req),
            pipe(
                () => requestRegistry.add(req, res, next),
                jobId => queue.add({
                    url: req.query.url
                }, {
                    ...DEFAULT_JOB_OPTIONS,
                    jobId,
                }),
            ),
            () => res.status(400).end('Missing url query parameter.')
        ),
    )))
