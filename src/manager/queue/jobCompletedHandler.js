import { juxt, when } from 'ramda'
import { resolveJobDuration } from './utils'

// jobCompletedHandler :: (Logger, Queue, RequestRegistry) -> Function
export default (logger, queue, requestRegistry) => (jobId, result) => when(
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
