import { resolveJobDuration } from './utils'

const resolveStatusCodeFromError = error => {
  if (/timeout/i.test(error) || /timed out/i.test(error)) return 504
  return 500
}

export default (logger, queue, requestRegistry) => async (jobId, error) => {
  if (!requestRegistry.has(jobId)) return

  const statusCode = resolveStatusCodeFromError(error)
  requestRegistry.fail(jobId, statusCode)

  const job = await queue.getJob(jobId)
  if (!job) return

  logger.error(`${jobId} ${job.data.url} ${statusCode} ${resolveJobDuration(job)} ${error}`)
  await job.remove()
}
