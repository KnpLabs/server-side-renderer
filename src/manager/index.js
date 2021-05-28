import { T, always, call, cond, juxt, pipe, tap, when } from 'ramda'
import TimeoutError from '../error/TimeoutError'
import { TimeoutError as PuppeteerTimeoutError } from 'puppeteer-core'
import createRequestRegistry from './requestRegistry'
import initHttpServer from './http-server'

const resolveStatusCodeFromError = cond([
  [error => error instanceof TimeoutError, always(504)],
  [error => error instanceof PuppeteerTimeoutError, always(504)],
  [T, always(500)],
])

// onJobCompleted :: (Logger, RequestRegistry) -> Function
const onJobCompleted = (logger, requestRegistry) => (jobId, result) => when(
  jobId => requestRegistry.has(jobId),
  juxt([
    jobId => requestRegistry.complete(jobId, JSON.parse(result)),
    jobId => logger.info(`Completed job "${jobId}"`),
  ]),
)(jobId)

// onJobFailed :: (Logger, RequestRegistry) -> Function
const onJobFailed = (logger, requestRegistry) => (jobId, error) => when(
  jobId => requestRegistry.has(jobId),
  juxt([
    jobId => requestRegistry.fail(jobId, resolveStatusCodeFromError(error)),
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
