import { call, juxt, pipe, tap, when } from 'ramda'
import createRequestRegistry from './requestRegistry'
import initHttpServer from './http-server'

const onJobCompleted = (logger, requestRegistry) => (jobId, result) => when(
  jobId => requestRegistry.has(jobId),
  juxt([
    jobId => requestRegistry.complete(jobId, JSON.parse(result)),
    jobId => logger.info(`Completed job "${jobId}"`),
  ]),
)(jobId)

const onJobFailed = (logger, requestRegistry) => (jobId, error) => when(
  jobId => requestRegistry.has(jobId),
  juxt([
    jobId => requestRegistry.fail(jobId),
    jobId => logger.error(`Job "${jobId}" has failed. ${error}.`),
  ]),
)(jobId)

// initManager :: (Configuration, Logger, Queue) -> _
export default (configuration, logger, queue) => call(pipe(
  () => logger.info('Initializing manager.'),
  () => createRequestRegistry(),
  tap(requestRegistry => queue.on('global:completed', onJobCompleted(logger, requestRegistry))),
  tap(requestRegistry => queue.on('global:failed', onJobFailed(logger, requestRegistry))),
  requestRegistry => initHttpServer(configuration, logger, queue, requestRegistry),
  () => logger.info('Manager initialized.'),
))
