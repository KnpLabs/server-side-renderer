import { resolveJobDuration } from './utils'

export default (logger, queue, requestRegistry) => async (jobId, result) => {
  if (!requestRegistry.has(jobId)) return
  requestRegistry.complete(jobId, JSON.parse(result))

  const job = await queue.getJob(jobId)
  if (!job) return

  logger.info(`${jobId} ${job.data.url} 200 ${resolveJobDuration(job)}`)
  await job.remove()
}
