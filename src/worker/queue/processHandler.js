import render from '../renderers/chrome'

// isJobExpired :: (Configuration, Job) -> Boolean
const isJobExpired = (configuration, job) =>
  Date.now() - job.data.queuedAt > configuration.queue.job.stale_timeout

// queueProcessHandler :: (Configuration, Logger, ScriptProvider) -> Function
export default (configuration, logger, scriptProvider) => async job => {
  if (isJobExpired(configuration, job)) {
    throw new Error(`Job "${job.id}" with url "${job.data.url}" timed out."`)
  }

  logger.debug(`Processing job "${job.id}" with url "${job.data.url}".`)

  return await render(configuration, logger, scriptProvider)(job.data.url)
}
