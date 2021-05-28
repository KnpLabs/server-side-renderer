import { T, always, call, cond, juxt, pipe, tap, test, when } from 'ramda'
import createRequestRegistry from './requestRegistry'
import initHttpServer from './http-server'

// resolveJobDuration :: Job -> Integer
const resolveJobDuration = job => ((new Date()).getTime() - job.data.queuedAt) / 1000

// resolveStatusCodeFromError :: String -> Integer
const resolveStatusCodeFromError = cond([
  [error => test(/timeout/i, error), always(504)],
  [error => test(/timed out/i, error), always(504)],
  [T, always(500)],
])

// onJobCompleted :: (Logger, Queue, RequestRegistry) -> Function
const onJobCompleted = (logger, queue, requestRegistry) => (jobId, result) => when(
  jobId => requestRegistry.has(jobId),
  juxt([
    jobId => requestRegistry.complete(jobId, JSON.parse(result)),
    async jobId => {
      const job = await queue.getJob(jobId)

      logger.info(`${jobId} ${job.data.url} 200 ${resolveJobDuration(job)}`)

      job.remove()
    },
  ]),
)(jobId)

// onJobFailed :: (Logger, Queue, RequestRegistry) -> Function
const onJobFailed = (logger, queue, requestRegistry) => (jobId, error) => when(
  jobId => requestRegistry.has(jobId),
  juxt([
    jobId => requestRegistry.fail(
      jobId,
      resolveStatusCodeFromError(error),
    ),
    async jobId => {
      const job = await queue.getJob(jobId)

      logger.error(`${jobId} ${job.data.url} ${resolveStatusCodeFromError(error)} ${resolveJobDuration(job)} ${error}`)

      job.remove()
    },
  ]),
)(jobId)

// initManager :: (Configuration, Logger, Queue) -> _
export default (configuration, logger, queue) => call(pipe(
  () => logger.debug('Initializing manager.'),
  () => createRequestRegistry(),
  tap(requestRegistry => queue.on('global:completed', onJobCompleted(logger, queue, requestRegistry))),
  tap(requestRegistry => queue.on('global:failed', onJobFailed(logger, queue, requestRegistry))),
  requestRegistry => initHttpServer(configuration, logger, queue, requestRegistry),
  () => logger.debug('Manager initialized.'),
))
