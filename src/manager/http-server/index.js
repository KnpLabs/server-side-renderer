import attachRenderMiddleware from './middlewares/render'
import express from 'express'
import { pipe } from 'ramda'

// createHttpServer => (Configuration, Logger, Queue, RequestRegistry) -> HttpServer
export default (configuration, logger, queue, requestRegistry) => pipe(
  attachRenderMiddleware(configuration, logger, queue, requestRegistry),
  app => app.listen(
    configuration.manager.http_server.port,
    configuration.manager.http_server.host,
    () => logger.debug('Manager http server started.'),
  ),
)(express())
