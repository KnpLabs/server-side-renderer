import { T, always, cond, juxt, test, when } from 'ramda'
import { resolveJobDuration } from './utils'

// resolveStatusCodeFromError :: String -> Integer
const resolveStatusCodeFromError = cond([
  [error => test(/timeout/i, error), always(504)],
  [error => test(/timed out/i, error), always(504)],
  [T, always(500)],
])

// jobFailedHandler :: (Logger, Queue, RequestRegistry) -> Function
export default (logger, queue, requestRegistry) => (jobId, error) => when(
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
