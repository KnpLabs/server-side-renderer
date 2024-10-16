import { call, complement, compose, ifElse, isNil, path, pipe } from 'ramda'
import { DEFAULT_JOB_OPTIONS } from '../../../queue'

// default :: (Configuration, Logger, Queue, RequestRegistry) -> Express.app -> Express.app
export default (configuration, logger, queue, requestRegistry) => app =>
  app.get('/render-image', (req, res, next) => call(pipe(
    () => logger.debug(`Image render request for url "${req.query.url}" started.`),
    ifElse(
      () => compose(complement(isNil), path(['query', 'url']))(req),
      pipe(
        () => requestRegistry.add(req, res, next),
        jobId => queue.add({
          type: 'image',
          url: req.query.url,
          queuedAt: Date.now(),
        }, {
          ...DEFAULT_JOB_OPTIONS,
          timeout: configuration.queue.job.timeout,
          jobId,
        }),
      ),
      () => res.status(400).end('Missing url query parameter.'),
    ),
  )))
