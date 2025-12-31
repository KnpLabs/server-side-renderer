import { DEFAULT_JOB_OPTIONS } from '../../../queue'

export default (configuration, logger, queue, requestRegistry) => app =>
  app.get('/render', (req, res, next) => {
    logger.debug(`Render request for url "${req.query.url}" started.`)

    if (req.query?.url == null) {
      return res.status(400).end('Missing url query parameter.')
    }

    const jobId = requestRegistry.add(req, res, next)

    return queue.add({
      url: req.query.url,
      queuedAt: Date.now(),
    }, {
      ...DEFAULT_JOB_OPTIONS,
      timeout: configuration.queue.job.timeout,
      jobId,
    })
  })
