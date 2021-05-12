import { pipe } from 'ramda'
import express from 'express'
import attachRenderMiddleware from './middlewares/render'

// createHttpServer => (Configuration, Logger, Queue) -> HttpServer
export default (configuration, logger, queue, requestRegistry) => pipe(
    attachRenderMiddleware(logger, queue, requestRegistry),
    app => app.listen(
        configuration.manager.http_server.port,
        configuration.manager.http_server.host,
        () => logger.info('Manager http server started.'),
    )
)(express())
